-- 14. Direct Messages - Add private messaging feature

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations." ON public.conversations;
CREATE POLICY "Users can view their own conversations."
  ON public.conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create conversations." ON public.conversations;
CREATE POLICY "Users can create conversations."
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.conversation_participants
      WHERE conversation_id = id
    )
  );

-- 6. Create RLS Policies for conversation_participants
DROP POLICY IF EXISTS "Users can view their own participation." ON public.conversation_participants;
CREATE POLICY "Users can view their own participation."
  ON public.conversation_participants FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join conversations." ON public.conversation_participants;
CREATE POLICY "Users can join conversations."
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave conversations." ON public.conversation_participants;
CREATE POLICY "Users can leave conversations."
  ON public.conversation_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create RLS Policies for messages
DROP POLICY IF EXISTS "Users can view messages in their conversations." ON public.messages;
CREATE POLICY "Users can view messages in their conversations."
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations." ON public.messages;
CREATE POLICY "Users can send messages in their conversations."
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can delete their own messages." ON public.messages;
CREATE POLICY "Users can delete their own messages."
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- 8. Create indexes for performance
DROP INDEX IF EXISTS idx_messages_conversation;
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);

DROP INDEX IF EXISTS idx_conversation_participants_user;
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);

-- 9. Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_conversation_timestamp();
