import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';

interface Props {
  symbol: string;
  color: string;
  size?: number;
  noContainer?: boolean;
}

// Static map — require() paths must be compile-time constants in Metro
const COIN_LOGOS: Record<string, any> = {
  BTC:  require('../assets/images/coins/btc.png'),
  ETH:  require('../assets/images/coins/eth.png'),
  SOL:  require('../assets/images/coins/sol.png'),
  BNB:  require('../assets/images/coins/bnb.png'),
  USDT: require('../assets/images/coins/usdt.png'),
  XRP:  require('../assets/images/coins/xrp.png'),
};

export function CoinIcon({ symbol, color, size = 44, noContainer = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const radius = size * 0.28;
  const logoSource = COIN_LOGOS[symbol];

  if (noContainer) {
    return logoSource && !hasError ? (
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setHasError(true)}
      />
    ) : (
      <Text style={{ color, fontSize: size * 0.4, fontWeight: '800', letterSpacing: -0.5 }}>
        {symbol.length > 3 ? symbol.slice(0, 2) : symbol.slice(0, 3)}
      </Text>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: `${color}18`,
        borderWidth: 1,
        borderColor: `${color}30`,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {logoSource && !hasError ? (
        <Image
          source={logoSource}
          style={{ width: size * 0.72, height: size * 0.72 }}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <Text
          style={{
            color,
            fontSize: size * 0.3,
            fontWeight: '800',
            letterSpacing: -0.5,
          }}
        >
          {symbol.length > 3 ? symbol.slice(0, 2) : symbol.slice(0, 3)}
        </Text>
      )}
    </View>
  );
}
