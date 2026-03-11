
import React, { useState } from 'react';
import { Frame, Creator } from './shared';
import { DiscoveryView } from './DiscoveryView';
import { CampaignView } from './CampaignView';
import { CreatorProfileView } from './CreatorProfileView';
import { EditorView } from './EditorView';

export const FrameEditor: React.FC = () => {
  const [viewState, setViewState] = useState<'DISCOVERY' | 'CAMPAIGN' | 'EDITOR' | 'CREATOR'>('DISCOVERY');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const handleSelectFrameForCampaign = (frame: Frame) => {
    setSelectedFrame(frame);
    setViewState('CAMPAIGN');
  };

  const handleUseFrame = (frame: Frame) => {
    setSelectedFrame(frame);
    setViewState('EDITOR');
  };

  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setViewState('CREATOR');
  };

  const handleBackToDiscovery = () => {
    setViewState('DISCOVERY');
    setSelectedFrame(null);
    setSelectedCreator(null);
  };

  const handleBackToCampaign = () => {
    // If we have a selected frame, go back to its campaign view, otherwise discovery
    if (selectedFrame) {
      setViewState('CAMPAIGN');
    } else {
      setViewState('DISCOVERY');
    }
  };

  return (
    <>
      {viewState === 'DISCOVERY' && (
        <DiscoveryView 
          onSelectFrame={handleSelectFrameForCampaign} 
          onSelectCreator={handleSelectCreator}
        />
      )}
      
      {viewState === 'CAMPAIGN' && selectedFrame && (
        <CampaignView
          frame={selectedFrame}
          onBack={handleBackToDiscovery}
          onUseFrame={handleUseFrame}
          onSelectCreator={handleSelectCreator}
        />
      )}

      {viewState === 'CREATOR' && selectedCreator && (
        <CreatorProfileView 
          creator={selectedCreator}
          onBack={handleBackToDiscovery}
          onSelectFrame={handleSelectFrameForCampaign}
        />
      )}

      {viewState === 'EDITOR' && selectedFrame && (
        <EditorView 
          initialFrame={selectedFrame} 
          onBack={handleBackToCampaign} 
        />
      )}
    </>
  );
};
