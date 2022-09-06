/**
 * This reference template is designed to showcase the elements used to construct your own
 * application.
 * 
 * When developing take care to:
 *  - Retain user interaction to begin audio.
 *  - Understand video sizing and mobile screen orientation.
 
 * See attached documentation for reference. Contact support@pureweb.com with any questions.
 * 
 *
 * Copyright (C) PureWeb 2020
 */

import {
  LaunchStatusEvent,
  LaunchStatusType,
  ModelDefinition,
  PlatformNext,
  UndefinedModelDefinition,
  InputEmitter,
  DefaultStreamerOptions,
  StreamerStatus,
  Resolution,
  streamResolutionConfiguration
} from '@pureweb/platform-sdk';

import {
  useStreamer,
  useLaunchRequest,
  IdleTimeout,
  LaunchRequestOptions,
  VideoStream,
  System
} from '@pureweb/platform-sdk-react';

import * as qs from 'query-string';
import React, { useEffect, useState, useRef } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Button, Icon } from 'semantic-ui-react';
import useAsyncEffect from 'use-async-effect';
import './App.css';
import clientConfig from './client.json';

import { LaunchView } from './Launch';
import logger from './Log';

const client: ClientJson = clientConfig as ClientJson;

class ClientJson {
  environmentId?: string;
  launchType?: string;
  projectId?: string;
  modelId?: string;
  version?: string;
  endpoint?: string;
  usePointerLock?: boolean;
  pointerLockRelease?: boolean;
  useNativeTouchEvents?: boolean;
  resolution?: string;
}

class ClientOptions {
  // Overridable connection options
  LaunchType?: string;

  // Launch queue configuration
  ProjectId?: string;
  ModelId?: string;
  Version?: string;
  EnvironmentId?: string;
  Endpoint?: string;

  // Overridable streamer options
  ForceRelay = false;
  UseNativeTouchEvents?: boolean;
  UsePointerLock?: boolean;
  PointerLockRelease?: boolean;
  Resolution?: Resolution;

  isValid(): boolean {
    if (!this.ProjectId) {
      return false;
    }
    if (!this.ModelId) {
      return false;
    }
    return true;
  }
}

interface LoadingProps {
  LaunchRequestStatus: LaunchStatusEvent;
  StreamerStatus: StreamerStatus;
}

const LoadingView: React.FC<LoadingProps> = (props: LoadingProps) => {
  if (props.StreamerStatus === StreamerStatus.Connected || props.StreamerStatus === StreamerStatus.Completed) {
    return <div />;
  }

  let content;

  if (props.StreamerStatus === StreamerStatus.NotSupported) {
    content = (
      <div>
        <h3>Your browser does not support the necessary WebRTC capabilities.</h3>
      </div>
    );
  }
  if (
    props.LaunchRequestStatus.status === LaunchStatusType.Unavailable ||
    props.LaunchRequestStatus.status === LaunchStatusType.Error ||
    props.StreamerStatus === StreamerStatus.Failed
  ) {
    content = (
      <div>
        <h3>The experience is presently unavailable.</h3>
        <h3>Please refresh to request a new session.</h3>
      </div>
    );
  } else {
    content = (
      <div>
        <svg className="logo" viewBox="410.5 265.5 90.12054 104.02344">
          <g fillRule="nonzero">
            <path d="M 495.4032 310.1983 L 484.1122 336.6803 C 483.9952 336.9373 483.8712 337.1633 483.7452 337.3853 L 459.3812 304.5723 L 477.0682 270.8543 C 478.1542 271.7123 478.9182 272.8703 479.6262 273.9833 L 480.0632 274.6613 L 495.0372 299.2173 C 495.9882 300.8173 496.5252 302.6543 496.5952 304.5553 C 496.6622 306.4163 496.2812 308.3503 495.4032 310.1983 M 448.9282 347.3083 C 448.5962 350.9113 448.2602 354.5423 447.7532 358.1613 C 447.2272 361.2263 446.4642 363.1463 445.4102 364.2293 C 444.4962 365.1683 443.2082 365.5153 441.5212 365.5073 L 434.7122 365.5073 C 431.3752 365.3863 430.9012 363.7163 429.4212 358.4833 C 429.1172 357.4093 428.7792 356.2143 428.4382 355.0733 C 428.3492 354.9843 419.5002 325.7033 417.1802 318.0873 L 437.5242 340.7223 C 438.4982 341.7353 439.5882 342.6203 440.7782 343.2493 C 441.9062 343.8473 443.1252 344.2143 444.4232 344.2493 L 449.2172 344.2233 C 449.1232 345.2093 449.0262 346.2453 448.9282 347.3083 M 475.7822 340.0613 C 475.7812 340.0613 475.7802 340.0623 475.7782 340.0623 C 475.7772 340.0623 475.7762 340.0613 475.7742 340.0613 L 444.5222 340.2333 C 443.8962 340.2143 443.2662 340.0153 442.6522 339.6903 C 441.8882 339.2863 441.1522 338.6853 440.4682 337.9813 L 416.1402 310.9083 C 415.7802 310.5073 415.4802 310.1443 415.2322 309.7873 L 455.7092 306.3673 L 480.4472 339.6853 C 479.2762 339.9463 477.7772 340.0643 475.7822 340.0613 M 430.4182 282.5003 C 431.9252 280.3873 433.5952 278.7143 435.5382 277.4503 C 437.4782 276.1883 439.7352 275.3073 442.4212 274.7693 L 471.2542 269.7603 C 471.9712 269.6263 472.6072 269.5813 473.2012 269.5833 L 456.0442 302.2923 C 456.0402 302.2933 456.0382 302.2953 456.0352 302.2963 L 414.7762 305.7823 C 414.9612 305.1193 415.2262 304.4623 415.6132 303.8563 L 430.4182 282.5003 M 498.4782 297.1393 C 494.8552 289.8933 487.6422 278.9223 483.0092 271.8113 C 480.7722 268.3063 478.2572 264.3733 470.5452 265.8003 L 441.6342 270.8183 C 438.4552 271.4533 435.7392 272.5253 433.3502 274.0793 C 430.9652 275.6313 428.9412 277.6463 427.1432 280.1703 C 422.2182 287.3093 417.2882 294.6593 412.2272 301.6833 C 411.5152 302.7953 411.0152 304.0283 410.7322 305.2793 C 410.5422 306.1473 410.5022 307.0243 410.5322 307.8933 C 410.5272 307.9843 410.4932 308.0683 410.5012 308.1613 C 410.5022 308.1823 410.5152 308.1983 410.5172 308.2183 C 410.5192 308.2443 410.5082 308.2683 410.5112 308.2943 C 410.5252 308.4063 410.5592 308.4853 410.5762 308.5923 C 410.5942 308.7653 410.5812 308.9443 410.6092 309.1163 C 411.0622 311.8913 412.0262 315.0063 412.9092 317.8673 L 424.5782 356.2233 C 424.9802 357.5693 425.2792 358.6233 425.5472 359.5703 C 427.6332 366.9413 428.3002 369.2943 434.5702 369.5223 L 441.5212 369.5233 C 444.2902 369.5343 446.5132 368.8593 448.2922 367.0323 C 449.9312 365.3483 451.0502 362.7473 451.7222 358.8383 L 451.7302 358.7753 C 452.2332 355.1963 452.5822 351.4193 452.9282 347.6713 C 453.0292 346.5673 453.1382 345.4223 453.2582 344.2013 L 475.7902 344.0773 C 475.7912 344.0773 475.7912 344.0763 475.7912 344.0763 C 479.2552 344.0813 481.6612 343.7543 483.4982 342.9103 C 485.5602 341.9623 486.8052 340.4913 487.7962 338.2863 L 499.0572 311.8803 C 500.2042 309.4543 500.7002 306.8953 500.6102 304.4133 C 500.5162 301.8253 499.7812 299.3223 498.4782 297.1393" />
          </g>
        </svg>
        <h3>Please wait, your session is loading.</h3>
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
      <div style={{ textAlign: 'center' }}>{content}</div>
    </div>
  );
};

interface ViewProps {
  LaunchRequestStatus: LaunchStatusEvent;
  StreamerStatus: StreamerStatus;
  VideoStream: MediaStream;
  InputEmitter: InputEmitter;
  UseNativeTouchEvents: boolean;
  UsePointerLock: boolean;
  PointerLockRelease: boolean;
  Resolution: Resolution;
}

const EmbeddedView: React.FC<ViewProps> = (props: ViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handle = useFullScreenHandle();
  // Fullscreen API presently supported on iPad, but not iPhone or iPod
  const isIPhone = System.Browser().os === 'iOS' && !window.navigator.userAgent.includes('iPad');
  return (
    <div style={{ height: '100%' }}>
      <FullScreen handle={handle}>
        <IdleTimeout
          Status={props.StreamerStatus}
          WarningThreshold={300}
          ExitThreshold={120}
          WarningCallback={handle.exit}
          ExitCallback={() => window.location.reload()} // TODO: How to 'close' a contribution?
        />

        <LoadingView LaunchRequestStatus={props.LaunchRequestStatus} StreamerStatus={props.StreamerStatus} />
        <VideoStream
          VideoRef={videoRef}
          Emitter={props.InputEmitter}
          Stream={props.VideoStream}
          UseNativeTouchEvents={props.UseNativeTouchEvents}
          UsePointerLock={props.UsePointerLock}
          PointerLockRelease={props.PointerLockRelease}
          Resolution={streamResolutionConfiguration(props.Resolution)}
        />

        <Button
          onClick={handle.enter}
          style={{ position: 'absolute', top: 10, right: 10 }}
          className={isIPhone || handle.active || props.StreamerStatus !== StreamerStatus.Connected ? 'hidden' : ''}>
          <Icon name="expand" />
        </Button>

        {props.StreamerStatus !== StreamerStatus.Connected && (
          <img
            alt="PureWeb Logo"
            src="/pureweb.svg"
            style={{ width: 100, position: 'absolute', bottom: 50, right: 10 }}
          />
        )}
      </FullScreen>
    </div>
  );
};

// Initialize audio.
// load() must be called from a user interaction, especially to retain iOS audio
// this can be 'mouseup', 'touchend' or 'keypress'
// Pass the audioStream created from useStreamer as the srcObject to play game audio.
const audio = new Audio();
audio.autoplay = true;
audio.volume = 0.5;

// Parse query parameters
const query = qs.parse(window.location.search);
const clientOptions: ClientOptions = new ClientOptions();
clientOptions.LaunchType = (query['launchType'] as string) ?? client.launchType;
if (query['collaboration'] && query['collaboration'] === 'true') {
  clientOptions.LaunchType = 'local';
}

clientOptions.Endpoint = (query['endpoint'] as string) ?? client.endpoint;
clientOptions.ProjectId = (query['projectId'] as string) ?? client.projectId;
clientOptions.ModelId = (query['modelId'] as string) ?? client.modelId;
clientOptions.Version = (query['version'] as string) ?? client.version;
clientOptions.EnvironmentId = (query['environmentId'] as string) ?? client.environmentId;
clientOptions.Resolution = (query['resolution'] as Resolution) ?? client.resolution;
clientOptions.Resolution = clientOptions.Resolution ?? Resolution.fhd;
// use client json config if usePointerLock query string parameter is undefined, else use query string parameter. Default to false if non are present
clientOptions.UsePointerLock =
  (query['usePointerLock'] === undefined ? client.usePointerLock : query['usePointerLock'] === 'true') ?? true;
// release the pointer lock on mouse up if true
clientOptions.PointerLockRelease =
  (query['pointerLockRelease'] === undefined ? client.pointerLockRelease : query['pointerLockRelease'] === 'true') ??
  true;

clientOptions.ForceRelay = query['forceRelay'] !== undefined ?? false;
clientOptions.UseNativeTouchEvents =
  (query['useNativeTouchEvents'] === undefined
    ? client.useNativeTouchEvents
    : query['useNativeTouchEvents'] === 'true') ?? false;
// Initialize platform reference
const platform = new PlatformNext();
platform.initialize({ endpoint: clientOptions.Endpoint || 'https://api.pureweb.io' });

const App: React.FC = () => {
  const [modelDefinitionUnavailable, setModelDefinitionUnavailable] = useState(false);
  const [modelDefinition, setModelDefinition] = useState(new UndefinedModelDefinition());
  const [availableModels, setAvailableModels] = useState<ModelDefinition[]>();
  const [launchRequestError, setLaunchRequestError] = useState<Error>();
  const streamerOptions = DefaultStreamerOptions;

  useAsyncEffect(async () => {
    if (clientOptions.ProjectId) {
      logger.info('Initializing available models: ' + clientOptions.ProjectId);
      try {
        await platform.useAnonymousCredentials(clientOptions.ProjectId, clientOptions.EnvironmentId);
        await platform.connect();
        logger.info('Agent Connected: ' + platform.agent.id);
        streamerOptions.iceServers = platform.agent.serviceCredentials.iceServers as RTCIceServer[];
        streamerOptions.forceRelay = clientOptions.ForceRelay;
        const models = await platform.getModels();
        setAvailableModels(models);
        logger.debug('Available models', models);
      } catch (err) {
        logger.error(err);
      }
    }
  }, [clientOptions]);

  useEffect(() => {
    if (availableModels?.length) {
      const selectedModels = availableModels.filter(function (model: ModelDefinition): boolean {
        if (clientOptions.ModelId === model.id) {
          // If there is a version specified and we encounter it
          if (clientOptions.Version && clientOptions.Version === model.version) {
            return true;
          }
          // If there is no version specified and we find the primary version
          if (!clientOptions.Version && model.active) {
            return true;
          }
        }
        return false;
      });
      if (selectedModels?.length) {
        setModelDefinition(selectedModels[0]);
      } else {
        setModelDefinitionUnavailable(true);
      }
    }
  }, [availableModels]);

  const launchRequestOptions: LaunchRequestOptions = {
    regionOverride: query['regionOverride'] as string,
    virtualizationProviderOverride: query['virtualizationProviderOverride'] as string
  };
  const [status, launchRequest, queueLaunchRequest] = useLaunchRequest(platform, modelDefinition, launchRequestOptions);
  const [streamerStatus, emitter, videoStream, audioStream, messageSubject] = useStreamer(
    platform,
    launchRequest,
    streamerOptions
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (streamerStatus === StreamerStatus.Failed) {
      platform.disconnect();
    }
  }, [streamerStatus]);

  if (audioStream) {
    audio.srcObject = audioStream;
  }

  const launch = async () => {
    setLoading(true);
    audio.load();

    if (clientOptions.LaunchType !== 'local') {
      try {
        await queueLaunchRequest();
      } catch (err) {
        setLaunchRequestError(err);
      }
    }
  };

  // Log status messages
  useEffect(() => {
    logger.info('Status', status, streamerStatus);
  }, [status, streamerStatus]);

  // Subscribe to game messages
  useEffect(() => {
    const subscription = messageSubject.subscribe(
      (value: string) => {
        logger.info('Message: ' + value);
      },
      (err) => {
        logger.error(err);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [messageSubject]);

  // Notify user of missing or errors in configuration
  if (!clientOptions.isValid()) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <p>
          Your client has one or more configuration errors. Please consult the{' '}
          <a href="https://www.npmjs.com/package/@pureweb/cra-template-pureweb-client"> README </a> for details on how
          to configure the client template.
        </p>
      </div>
    );
  }

  if (modelDefinitionUnavailable) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <span>The model that you have requested does not exist</span>
      </div>
    );
  }

  if (launchRequestError) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <span>
          {process.env.NODE_ENV === 'development'
            ? `There was an error with the launch request: ${launchRequestError}`
            : 'It appears the requested model is currently not online as per your set schedule. Please contact support if it should be available.'}
        </span>
      </div>
    );
  }

  // Begin connection
  if (streamerStatus === StreamerStatus.Disconnected) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <h2>Disconnected from stream</h2>
      </div>
    );
  }

  if (streamerStatus === StreamerStatus.Failed) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <h2>Failure during stream</h2>
        <h2>Please refresh to request a new session</h2>
      </div>
    );
  }

  if (streamerStatus === StreamerStatus.Withdrawn) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <h2>Streamer contribution withdrawn</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <EmbeddedView
        VideoStream={videoStream}
        StreamerStatus={streamerStatus as StreamerStatus}
        LaunchRequestStatus={status}
        InputEmitter={emitter}
        UseNativeTouchEvents={clientOptions.UseNativeTouchEvents!}
        UsePointerLock={clientOptions.UsePointerLock!}
        PointerLockRelease={clientOptions.PointerLockRelease!}
        Resolution={clientOptions.Resolution!}
      />
    );
  } else if (clientOptions.LaunchType !== 'local' && !availableModels) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <h2>Initializing...</h2>
      </div>
    );
  } else if (clientOptions.LaunchType !== 'local' && !availableModels?.length) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'none',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <h2>No models are currently available in this environment.</h2>
      </div>
    );
  } else {
    return <LaunchView Launch={launch} />;
  }
};

const AppWrapper: React.FC = () => {
  return System.IsBrowserSupported() ? (
    <App />
  ) : (
    <div className="ui red segment center aligned basic">
      <h2 className="header">Your browser is currently unsupported</h2>
    </div>
  );
};

export default AppWrapper;
