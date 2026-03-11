import React, { useState, useEffect } from 'react';

export const AnimatedLogo: React.FC<{ className?: string; loopInterval?: number; size?: number }> = ({ className = '', loopInterval, size }) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!loopInterval) return;
    const interval = setInterval(() => {
      setAnimKey(prev => prev + 1);
    }, loopInterval);
    return () => clearInterval(interval);
  }, [loopInterval]);

  const containerStyle = size ? { width: size, height: size } : {};

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={containerStyle}
    >
      <style>
        {`
          @keyframes sweep-reveal {
            0% { 
              clip-path: polygon(50% 50%, 0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%);
              -webkit-clip-path: polygon(50% 50%, 0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%);
            }
            25% { 
              clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 0% 0%, 0% 0%, 0% 0%);
              -webkit-clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 0% 0%, 0% 0%, 0% 0%);
            }
            50% { 
              clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 100% 0%, 100% 0%, 100% 0%);
              -webkit-clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 100% 0%, 100% 0%, 100% 0%);
            }
            75% { 
              clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 100% 100%);
              -webkit-clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 100% 100%);
            }
            100% { 
              clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 0% 100%);
              -webkit-clip-path: polygon(50% 50%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 0% 100%);
            }
          }
          @keyframes wipe-down {
            0% { 
              clip-path: inset(0 0 100% 0);
              -webkit-clip-path: inset(0 0 100% 0);
            }
            100% { 
              clip-path: inset(0 0 0 0);
              -webkit-clip-path: inset(0 0 0 0);
            }
          }
          @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .logo-outer {
            animation: sweep-reveal 1.2s cubic-bezier(0.4, 0, 0.2, 1) both;
            -webkit-animation: sweep-reveal 1.2s cubic-bezier(0.4, 0, 0.2, 1) both;
            transform-box: view-box;
            transform-origin: 50% 50%;
          }
          .logo-bookmark-group {
            animation: wipe-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.9s both;
            -webkit-animation: wipe-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.9s both;
            transform-box: view-box;
            transform-origin: 50% 50%;
          }
          .logo-play {
            animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s both;
            -webkit-animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s both;
            transform-box: view-box;
            transform-origin: 50% 50%;
          }
        `}
      </style>
      <div className="w-full h-full flex items-center justify-center">
        <svg 
          key={animKey} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 3000 3000" 
          className="w-full h-full max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
        <defs>
          <clipPath id="009b754636"><path d="M 297.886719 160 L 2702.386719 160 L 2702.386719 2840 L 297.886719 2840 Z M 297.886719 160 " clipRule="nonzero"/></clipPath>
          <clipPath id="229c3c19d1"><path d="M 699.75 608 L 2300.25 608 L 2300.25 2392 L 699.75 2392 Z M 699.75 608 " clipRule="nonzero"/></clipPath>
          <clipPath id="fa8e03590c"><path d="M 1194.039062 1163 L 1794 1163 L 1794 1836 L 1194.039062 1836 Z M 1194.039062 1163 " clipRule="nonzero"/></clipPath>
          <clipPath id="2e0bb4c910"><path d="M 599 596 L 898 596 L 898 834 L 599 834 Z M 599 596 " clipRule="nonzero"/></clipPath>
          <clipPath id="b97c8111b5"><path d="M 842.511719 504.5 L 952.398438 689.285156 L 709.144531 833.941406 L 599.257812 649.152344 Z M 842.511719 504.5 " clipRule="nonzero"/></clipPath>
          <clipPath id="03dcc4ef23"><path d="M 897.457031 596.894531 L 709.722656 833.59375 L 599.839844 648.808594 Z M 897.457031 596.894531 " clipRule="nonzero"/></clipPath>
          <clipPath id="a471c87968"><path d="M 0.761719 0.878906 L 298.601562 0.878906 L 298.601562 237.761719 L 0.761719 237.761719 Z M 0.761719 0.878906 " clipRule="nonzero"/></clipPath>
          <clipPath id="5c13ea3340"><path d="M 243.511719 -91.5 L 353.398438 93.285156 L 110.144531 237.941406 L 0.257812 53.152344 Z M 243.511719 -91.5 " clipRule="nonzero"/></clipPath>
          <clipPath id="72d2a17a28"><path d="M 298.457031 0.894531 L 110.722656 237.59375 L 0.839844 52.808594 Z M 298.457031 0.894531 " clipRule="nonzero"/></clipPath>
          <clipPath id="dbcc6db75e"><rect x="0" width="299" y="0" height="238"/></clipPath>
          <clipPath id="08ed94cb9f"><path d="M 499.933594 752.824219 L 699.75 752.824219 L 699.75 1206.617188 L 499.933594 1206.617188 Z M 499.933594 752.824219 " clipRule="nonzero"/></clipPath>
          <clipPath id="0593855114"><path d="M 0.933594 0.824219 L 200.75 0.824219 L 200.75 454.617188 L 0.933594 454.617188 Z M 0.933594 0.824219 " clipRule="nonzero"/></clipPath>
          <clipPath id="7a5bc45cb4"><rect x="0" width="201" y="0" height="455"/></clipPath>
          <clipPath id="91134ef3e5"><path d="M 383.953125 518.640625 L 784.453125 518.640625 L 784.453125 783.390625 L 383.953125 783.390625 Z M 383.953125 518.640625 " clipRule="nonzero"/></clipPath>
          <clipPath id="71c0a69356"><path d="M 380 701 L 516.585938 701 L 516.585938 855 L 380 855 Z M 380 701 " clipRule="nonzero"/></clipPath>
          <clipPath id="567077a335"><path d="M 589 952 L 899.792969 952 L 899.792969 1300 L 589 1300 Z M 589 952 " clipRule="nonzero"/></clipPath>
          <clipPath id="d0b4e42fb1"><path d="M 1 0.078125 L 310.582031 0.078125 L 310.582031 347.601562 L 1 347.601562 Z M 1 0.078125 " clipRule="nonzero"/></clipPath>
          <clipPath id="ca822f150a"><rect x="0" width="311" y="0" height="348"/></clipPath>
          <clipPath id="22bede0aef"><path d="M 656.433594 990.621094 L 791.957031 990.621094 L 791.957031 1076.710938 L 656.433594 1076.710938 Z M 656.433594 990.621094 " clipRule="nonzero"/></clipPath>
          <clipPath id="7178a78bf5"><path d="M 724.269531 990.621094 C 686.992188 990.621094 656.769531 1009.890625 656.769531 1033.664062 C 656.769531 1057.4375 686.992188 1076.710938 724.269531 1076.710938 C 761.546875 1076.710938 791.769531 1057.4375 791.769531 1033.664062 C 791.769531 1009.890625 761.546875 990.621094 724.269531 990.621094 Z M 724.269531 990.621094 " clipRule="nonzero"/></clipPath>
          <clipPath id="05b8ae07a5"><path d="M 0.640625 0.621094 L 135.957031 0.621094 L 135.957031 86.710938 L 0.640625 86.710938 Z M 0.640625 0.621094 " clipRule="nonzero"/></clipPath>
          <clipPath id="2380d2aafe"><path d="M 68.269531 0.621094 C 30.992188 0.621094 0.769531 19.890625 0.769531 43.664062 C 0.769531 67.4375 30.992188 86.710938 68.269531 86.710938 C 105.546875 86.710938 135.769531 67.4375 135.769531 43.664062 C 135.769531 19.890625 105.546875 0.621094 68.269531 0.621094 Z M 68.269531 0.621094 " clipRule="nonzero"/></clipPath>
          <clipPath id="1300ab2107"><rect x="0" width="136" y="0" height="87"/></clipPath>
          <clipPath id="0481f36c11"><path d="M 686.722656 588.835938 L 899.796875 588.835938 L 899.796875 1076.710938 L 686.722656 1076.710938 Z M 686.722656 588.835938 " clipRule="nonzero"/></clipPath>
          <clipPath id="664cde89dc"><path d="M 0.722656 0.835938 L 213.796875 0.835938 L 213.796875 488.710938 L 0.722656 488.710938 Z M 0.722656 0.835938 " clipRule="nonzero"/></clipPath>
          <clipPath id="7999bb9700"><rect x="0" width="214" y="0" height="489"/></clipPath>
          <clipPath id="21686d47c5"><path d="M 699.8125 1824.335938 L 1099.628906 1824.335938 L 1099.628906 2659.144531 L 699.8125 2659.144531 Z M 699.8125 1824.335938 " clipRule="nonzero"/></clipPath>
          <clipPath id="481d99c294"><path d="M 0.8125 0.335938 L 400.628906 0.335938 L 400.628906 835.144531 L 0.8125 835.144531 Z M 0.8125 0.335938 " clipRule="nonzero"/></clipPath>
          <clipPath id="9f7b536640"><rect x="0" width="401" y="0" height="836"/></clipPath>
          
          <mask id="logo-mask">
            <rect width="3000" height="3000" fill="white" />
            <g clipPath="url(#229c3c19d1)">
              <path fill="black" d="M 2204.265625 2017.5 L 1596.03125 2368.65625 C 1543.027344 2399.261719 1456.972656 2399.261719 1403.96875 2368.65625 L 795.734375 2017.5 C 742.734375 1986.894531 699.707031 1912.355469 699.707031 1851.164062 L 699.707031 1148.835938 C 699.707031 1087.640625 742.734375 1013.105469 795.734375 982.496094 L 1099.851562 806.921875 L 1403.96875 631.34375 C 1456.972656 600.738281 1543.027344 600.738281 1596.03125 631.34375 L 1900.148438 806.921875 L 2204.265625 982.496094 C 2257.265625 1013.105469 2300.292969 1087.640625 2300.292969 1148.835938 L 2300.292969 1851.164062 C 2300.292969 1912.355469 2257.265625 1986.894531 2204.265625 2017.5 Z M 2204.265625 2017.5 "/>
            </g>
            <g clipPath="url(#21686d47c5)">
              <g transform="matrix(1, 0, 0, 1, 699, 1824)">
                <g clipPath="url(#9f7b536640)">
                  <g clipPath="url(#481d99c294)">
                    <path fill="black" d="M 0.8125 0.335938 L 400.628906 0.335938 L 400.628906 835.886719 L 0.8125 835.886719 Z M 0.8125 0.335938 "/>
                  </g>
                </g>
              </g>
            </g>
          </mask>
        </defs>
        
        {/* Outer Hexagon (Blue) */}
        <g className="logo-outer">
          <rect width="3000" height="3000" fill="none" pointerEvents="none" />
          <g mask="url(#logo-mask)">
            <g clipPath="url(#009b754636)">
              <path fill="#007c99" d="M 2557.917969 2277.375 L 2101.085938 2541.121094 L 1644.25 2804.863281 C 1564.632812 2850.84375 1435.359375 2850.84375 1355.742188 2804.863281 L 898.910156 2541.121094 L 442.074219 2277.375 C 362.457031 2231.394531 297.820312 2119.429688 297.820312 2027.507812 L 297.820312 972.492188 C 297.820312 880.570312 362.457031 768.601562 442.074219 722.625 L 898.910156 458.878906 L 1355.742188 195.132812 C 1435.359375 149.15625 1564.632812 149.15625 1644.25 195.132812 L 2101.085938 458.878906 L 2557.917969 722.625 C 2637.535156 768.601562 2702.171875 880.570312 2702.171875 972.492188 L 2702.171875 2027.507812 C 2702.171875 2119.429688 2637.535156 2231.394531 2557.917969 2277.375 Z M 2557.917969 2277.375 "/>
            </g>
          </g>
        </g>
        
        {/* Play Icon (Yellow) */}
        <g clipPath="url(#fa8e03590c)" className="logo-play">
          <rect width="3000" height="3000" fill="none" pointerEvents="none" />
          <path fill="#e6b106" d="M 1194.128906 1768.070312 L 1194.128906 1231.476562 C 1194.128906 1170.992188 1236.65625 1146.4375 1289.035156 1176.679688 L 1521.390625 1310.828125 L 1753.742188 1444.980469 C 1806.121094 1475.21875 1806.121094 1524.328125 1753.742188 1554.570312 L 1521.390625 1688.71875 L 1289.035156 1822.867188 C 1236.65625 1853.109375 1194.128906 1828.554688 1194.128906 1768.070312 Z M 1194.128906 1768.070312 "/>
        </g>
        
        {/* P and Bookmark shapes (Yellow) */}
        <g className="logo-bookmark-group">
          <rect width="3000" height="3000" fill="none" pointerEvents="none" />
          <g clipPath="url(#2e0bb4c910)">
            <g clipPath="url(#b97c8111b5)">
              <g clipPath="url(#03dcc4ef23)">
                <g transform="matrix(1, 0, 0, 1, 599, 596)">
                  <g clipPath="url(#dbcc6db75e)">
                    <g clipPath="url(#a471c87968)">
                      <g clipPath="url(#5c13ea3340)">
                        <g clipPath="url(#72d2a17a28)">
                          <path fill="#e6b106" d="M 243.511719 -91.5 L 353.398438 93.285156 L 110.863281 237.511719 L 0.980469 52.722656 Z M 243.511719 -91.5 "/>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
          <path fill="#e6b106" d="M 780.328125 642.234375 L 780.328125 535.347656 C 780.328125 523.300781 788.800781 518.410156 799.230469 524.433594 L 845.515625 551.15625 L 891.796875 577.875 C 902.230469 583.902344 902.230469 593.683594 891.796875 599.707031 L 845.515625 626.429688 L 799.230469 653.148438 C 788.800781 659.171875 780.328125 654.28125 780.328125 642.234375 Z M 780.328125 642.234375 "/>
          <g clipPath="url(#08ed94cb9f)">
            <g transform="matrix(1, 0, 0, 1, 499, 752)">
              <g clipPath="url(#7a5bc45cb4)">
                <g clipPath="url(#0593855114)">
                  <path fill="#e6b106" d="M 0.933594 0.824219 L 200.75 0.824219 L 200.75 454.316406 L 0.933594 454.316406 Z M 0.933594 0.824219 "/>
                </g>
              </g>
            </g>
          </g>
          <g clipPath="url(#91134ef3e5)">
            <path fill="#e6b106" d="M 2560.03125 2274.675781 L 2103.199219 2538.417969 L 1646.363281 2802.164062 C 1566.746094 2848.140625 1437.472656 2848.140625 1357.855469 2802.164062 L 901.019531 2538.417969 L 444.1875 2274.675781 C 364.570312 2228.695312 299.933594 2116.726562 299.933594 2024.804688 L 299.933594 969.792969 C 299.933594 877.871094 364.570312 765.902344 444.1875 719.921875 L 901.019531 456.179688 L 1357.855469 192.433594 C 1437.472656 146.457031 1566.746094 146.457031 1646.363281 192.433594 L 2103.199219 456.179688 L 2560.03125 719.921875 C 2639.648438 765.902344 2704.285156 877.871094 2704.285156 969.792969 L 2704.285156 2024.804688 C 2704.285156 2116.726562 2639.648438 2228.695312 2560.03125 2274.675781 Z M 2560.03125 2274.675781 "/>
          </g>
          <path fill="#e6b106" d="M 500.003906 1312.589844 L 500.003906 1086.53125 C 500.003906 1061.050781 517.921875 1050.707031 539.988281 1063.445312 L 735.761719 1176.476562 C 757.828125 1189.214844 757.828125 1209.902344 735.761719 1222.644531 L 637.875 1279.160156 L 539.988281 1335.671875 C 517.921875 1348.414062 500.003906 1338.070312 500.003906 1312.589844 Z M 500.003906 1312.589844 "/>
          <g clipPath="url(#71c0a69356)">
            <path fill="#e6b106" d="M 516.839844 717.0625 L 516.839844 838.957031 C 516.839844 852.699219 507.179688 858.277344 495.28125 851.40625 L 442.496094 820.933594 L 389.714844 790.457031 C 377.816406 783.589844 377.816406 772.433594 389.714844 765.5625 L 442.496094 735.089844 L 495.28125 704.617188 C 507.179688 697.746094 516.839844 703.324219 516.839844 717.0625 Z M 516.839844 717.0625 "/>
          </g>
          <g clipPath="url(#567077a335)">
            <g transform="matrix(1, 0, 0, 1, 589, 952)">
              <g clipPath="url(#ca822f150a)">
                <g clipPath="url(#d0b4e42fb1)">
                  <path fill="#e6b106" d="M 310.703125 312.414062 L 310.703125 35.417969 C 310.703125 4.199219 288.75 -8.476562 261.710938 7.132812 L 141.765625 76.382812 L 21.824219 145.628906 C -5.210938 161.242188 -5.210938 186.589844 21.824219 202.203125 L 141.765625 271.449219 L 261.710938 340.699219 C 288.75 356.308594 310.703125 343.636719 310.703125 312.414062 Z M 310.703125 312.414062 "/>
                </g>
              </g>
            </g>
          </g>
          <g clipPath="url(#22bede0aef)">
            <g clipPath="url(#7178a78bf5)">
              <g transform="matrix(1, 0, 0, 1, 656, 990)">
                <g clipPath="url(#1300ab2107)">
                  <g clipPath="url(#05b8ae07a5)">
                    <g clipPath="url(#2380d2aafe)">
                      <path fill="#e6b106" d="M 0.769531 0.621094 L 135.621094 0.621094 L 135.621094 86.710938 L 0.769531 86.710938 Z M 0.769531 0.621094 "/>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
          <g clipPath="url(#0481f36c11)">
            <g transform="matrix(1, 0, 0, 1, 686, 588)">
              <g clipPath="url(#7999bb9700)">
                <g clipPath="url(#664cde89dc)">
                  <path fill="#e6b106" d="M 0.722656 0.835938 L 213.796875 0.835938 L 213.796875 488.578125 L 0.722656 488.578125 Z M 0.722656 0.835938 "/>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
      </div>
    </div>
  );
};
