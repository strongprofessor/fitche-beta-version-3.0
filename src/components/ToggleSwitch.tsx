import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #e4e6eb;
  margin-bottom: 15px;
`;

const SwitchWrapper = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  background: #fff;
  padding: 5px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: 8px 24px;
  border: none;
  border-radius: 15px;
  background: ${props => props.isActive ? '#1877f2' : 'none'};
  color: ${props => props.isActive ? 'white' : 'inherit'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
`;

interface ToggleSwitchProps {
    active: 'Feed' | 'Ads';
    setActive: (tab: 'Feed' | 'Ads') => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ active, setActive }) => {
    return (
        <ToggleContainer>
            <SwitchWrapper>
                <ToggleButton 
                    isActive={active === 'Feed'}
                    onClick={() => setActive('Feed')}
                >
                    Feed
                </ToggleButton>
                <ToggleButton 
                    isActive={active === 'Ads'}
                    onClick={() => setActive('Ads')}
                >
                    Ads
                </ToggleButton>
            </SwitchWrapper>
        </ToggleContainer>
    );
};

export default ToggleSwitch; 