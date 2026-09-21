import { colors } from '@/theme';
import { View } from 'react-native';

type Kind = 'hoy' | 'grupo' | 'planes' | 'yo';

export function TabMark({ kind, focused }: { kind: Kind; focused: boolean }) {
  const color = focused ? '#E8C48A' : '#8A8176';

  if (kind === 'hoy') {
    return (
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      </View>
    );
  }

  if (kind === 'grupo') {
    return (
      <View style={{ width: 22, height: 22, flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 11,
            height: 11,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: color,
          }}
        />
        <View
          style={{
            width: 11,
            height: 11,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: color,
            marginLeft: -4,
          }}
        />
      </View>
    );
  }

  if (kind === 'planes') {
    return (
      <View style={{ width: 18, height: 16, justifyContent: 'space-between' }}>
        <View style={{ height: 2, backgroundColor: color }} />
        <View style={{ height: 2, backgroundColor: color, width: '70%' }} />
        <View style={{ height: 2, backgroundColor: color, width: '85%' }} />
      </View>
    );
  }

  return (
    <View style={{ width: 22, height: 22, alignItems: 'center' }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: color,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 14,
          height: 8,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderWidth: 2,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
    </View>
  );
}
