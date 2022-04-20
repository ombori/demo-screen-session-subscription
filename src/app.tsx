import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { getInstance as gs } from '@ombori/grid-signals-react';
import styled from 'styled-components';
import { useSettings } from '@ombori/ga-settings';
import { useHeartbeat } from '@ombori/ga-messaging';
import logo from './logo.svg';
import { Schema as Settings } from './schema';
import ShortUrlQrCode from '@ombori/ga-react-qr-run';

const isProd = process.env.NODE === 'production';

function App() {
  useHeartbeat();
  const [productCount, setProductCount] = useState(0);
  const settings = useSettings<Settings>();

  const productName = settings?.productName;
  const productPrice = settings?.productPrice;

  useEffect(() => {
    if (productName) {
      gs().sendContentView({ title: productName });
    }
  }, [productName]);

  const url = useMemo(() => {
    const sessionId = gs().getInstanceProps().sessionId;
    if (!isProd) {
      return 'http://localhost:3001/#sessionId=' + sessionId;
    }

    return `${settings?.mobileEndpoint?.prod?.url}#sessionId=${sessionId}`;
  }, [settings]);

  useEffect(() => {
    let sessionState: any;
    let sessionEvent: any;
    const startSessionSubscription = async () => {
      sessionState  = await gs().subscribeSessionState((sessionState) => {
        setProductCount(sessionState.CART['TEMPORARY-PRODUCT-ID-123']);
      });

      sessionEvent = await gs().subscribeSessionEvent((sessionEvent) => {
        console.log('SESSION_EVENT', sessionEvent);
      });
    }

    startSessionSubscription();

    return () => {
      if (sessionState) sessionState.stop();
      if (sessionEvent) sessionEvent.stop();
    }
  }, []);

  const onAddToCart = useCallback(() => {
    gs().sendCartAdd({ productId: 'TEMPORARY-PRODUCT-ID-123', quantity: 1 })
  }, []);

  if (!settings) {
    return <Container>Loading gridapp settings...</Container>
  }

  return (
    <Container>
      <ProductInfo>
        <Logo src={logo} alt="logo" />
        <p>Product name: {productName}</p>
        <p>Product price: {productPrice}</p>
        <Button onClick={onAddToCart}>Add to Cart</Button>
      </ProductInfo>
      <RealTimeInfo>
        <p>Real Cart Subscription</p>
        <p>{productName} count: {productCount}</p>
        <QRCode size={112} url={url} />
        <span>{url}</span>
        <p>Scan the QR code to control the screen on mobile</p>
      </RealTimeInfo>
    </Container>
  );
}

const QRCode = styled(ShortUrlQrCode)`
  margin-top: 72px;
  padding-bottom: 12px;
`;

const Container = styled.div`
  text-align: center;
  background-color: #282c34;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: row;
  width: 100%;
  color: white;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 1.5vmin);
`;

const ProductInfo = styled.header`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 64px;
  border-right: solid 1px white;
`;

const Logo = styled.img`
  height: 40vmin;
  pointer-events: none;
`;

const Button = styled.button`
  padding: 16px 32px;
  margin-top: 24px;
  align-self: center;
  border-radius: 8px;
`;

const RealTimeInfo = styled.footer`
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  pointer-events: none;
  align-items: center;
  justify-content: center;

  p {
    padding-top: 24px;
  }

  span {
    font-size: 12px;
  }
`;

export default App;
