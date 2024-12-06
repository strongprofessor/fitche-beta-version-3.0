import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface TapPatternProps {
  onComplete: (code: string) => void;
}

const TapPattern: React.FC<TapPatternProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);

  const handleTap = (position: number) => {
    const newSequence = [...sequence, position];
    
    if (newSequence.length === 4) {
      onComplete(newSequence.join(''));
      setSequence([]);
    } else {
      setSequence(newSequence);
    }
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3].map((i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.square,
            sequence.includes(i) && styles.tapped
          ]}
          onPress={() => handleTap(i)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  square: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  tapped: {
    backgroundColor: '#a0a0a0',
  },
});

export default TapPattern; 