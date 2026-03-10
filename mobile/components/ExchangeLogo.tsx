import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';

interface Props {
  exchangeId: string;
  color: string;
  colorDim: string;
  size?: number;
  noContainer?: boolean;
}

const EXCHANGE_LOGOS: Record<string, any> = {
  binance:  require('../assets/images/exchanges/binance.png'),
  coinbase: require('../assets/images/exchanges/coinbase.png'),
  kraken:   require('../assets/images/exchanges/kraken.png'),
  okx:      require('../assets/images/exchanges/okx.png'),
  bybit:    require('../assets/images/exchanges/bybit.png'),
  kucoin:   require('../assets/images/exchanges/kucoin.png'),
  gateio:   require('../assets/images/exchanges/gateio.png'),
  mexc:     require('../assets/images/exchanges/mexc.png'),
};

export function ExchangeLogo({ exchangeId, color, colorDim, size = 44, noContainer = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const radius = size * 0.28;
  const logoSource = EXCHANGE_LOGOS[exchangeId];
  const initial = exchangeId[0].toUpperCase();

  if (noContainer) {
    return logoSource && !hasError ? (
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setHasError(true)}
      />
    ) : (
      <Text style={{ color, fontSize: size * 0.5, fontWeight: '900', letterSpacing: -0.5 }}>
        {initial}
      </Text>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: colorDim,
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
          style={{ width: size * 0.68, height: size * 0.68 }}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <Text
          style={{
            color,
            fontSize: size * 0.38,
            fontWeight: '900',
            letterSpacing: -0.5,
          }}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}
