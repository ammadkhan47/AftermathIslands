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
import React, {useEffect, useState, useRef} from 'react';
import {FullScreen, useFullScreenHandle} from 'react-full-screen';
import {Button, Icon} from 'semantic-ui-react';
import './App.css';
import clientConfig from './client.json';
import clientTestingConfig from './client_testing.json';
import {LaunchView} from './Launch';
import logger from './Log';
import {isMobile, browserName} from "react-device-detect";

//import AftermathIslandsVideo from './video/AftermathIslandsVideo.mp4';

const client: ClientJson = true ? clientTestingConfig : clientConfig as ClientJson;

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
    setAvatarValue: (e: string) => void;


}


const LoadingView: React.FC<LoadingProps> = (props: LoadingProps) => {


    /*

    if(window.location.href.includes("code")){

    }else{
    window.open("https://dev.aftermath.accelbyte.io/iam/v3/oauth/authorize?response_type=code&client_id=c5ef28c8e1f54d0583144b3e5cb9695e&redirect_uri=https%3A%2F%2Fplay.aftermathislands.com&state=%7B%22csrf%22%3A%22e1e0f113-bcfa-45f7-b8ab-d46ee8a1aafd%22%2C%22payload%22%3A%22%7B%5C%22path%5C%22%3A%5C%22https%3A%2F%2Fplay.aftermathislands.com%5C%22%7D%22%7D&code_challenge=cMWHQ83_6MVGK21-H7B68VzEIkkgzM6U_Dt9keeuFZc&code_challenge_method=S256&createHeadless=true" , "_self");
    }

  */


    //RPM

    const iframe = useRef<any>();

    const subscribe = (event: any) => {
        const json = parse(event);
        if (json?.source !== "readyplayerme") {
            return;
        }

        // Susbribe to all events sent from Ready Player Me once frame is ready
        if (json.eventName === "v1.frame.ready") {
            iframe.current.contentWindow.postMessage(
                JSON.stringify({
                    target: "readyplayerme",
                    type: "subscribe",
                    eventName: "v1.**",
                }),
                "*"
            );
        }

        // Get avatar GLB URL
        if (json.eventName === "v1.avatar.exported") {
            console.log(`Avatar URRRL: ${json.data.url}`);
            props.setAvatarValue(json.data.url);
            abc();
        }

        // Get user id
        if (json.eventName === "v1.user.set") {
            console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);


        }
    };

    window.addEventListener("message", subscribe);
    document.addEventListener("message", subscribe);

    const parse = (event: any) => {
        try {
            return JSON.parse(event.data);
        } catch (error) {
            return null;
        }
    };
    return (
        <div>
            <div>
                <iframe id='rpmiframe' className='rpmiframe'
                        style={{
                            width: "100%",
                            height: "100vh",
                        }}
                        allow="camera *; microphone *"
                        src="https://aftermathislands.readyplayer.me/avatar?frameApi&clearCache"
                        title="Ready Player Me"
                        ref={iframe}
                ></iframe>
            </div>
            <div style={{height: '0', width: "0"}}>
                <video id='videoOfBackground' className='videoOfBackground' playsInline loop>
                    <track kind="captions" {...props} />
                    <source src="/video/AftermathIslandsVideo.mp4" type='video/mp4'/>
                </video>
                <svg className="logo" viewBox="410.5 265.5 90.12054 104.02344">

                </svg>

            </div>
        </div>
    );

    //RPM
    function abc() {

        const iframe = document.getElementById('rpmiframe') as HTMLIFrameElement;
        if (iframe != null) {
            iframe.remove()
        }


        const backgroundvideo = document.getElementById('videoOfBackground') as HTMLVideoElement;
        if (backgroundvideo != null) {
            backgroundvideo.style.display = "block";
            backgroundvideo.style.width = "100vw";
            backgroundvideo.style.height = "100vh";
            backgroundvideo.play();
        }


        if (props.StreamerStatus === StreamerStatus.Connected || props.StreamerStatus === StreamerStatus.Completed) {
            return <div/>;
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
                <div style={{height: '100vh', width: "100vw"}}>

                    <svg className="logo" viewBox="410.5 265.5 90.12054 104.02344">

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
                <div style={{textAlign: 'center'}}>{content}</div>
            </div>
        );
    }


}


interface ViewProps {
    LaunchRequestStatus: LaunchStatusEvent;
    StreamerStatus: StreamerStatus;
    VideoStream: MediaStream;
    InputEmitter: InputEmitter;
    UseNativeTouchEvents: boolean;
    UsePointerLock: boolean;
    PointerLockRelease: boolean;
    Resolution: Resolution;
    setAvatarValue: (e: string) => void;
}

const EmbeddedView: React.FC<ViewProps> = (props: ViewProps) => {


    const videoRef = useRef<HTMLVideoElement>(null);
    const handle = useFullScreenHandle();
    // Fullscreen API presently supported on iPad, but not iPhone or iPod
    const isIPhone = System.Browser().os === 'iOS' && !window.navigator.userAgent.includes('iPad');
    return (
        <div style={{height: '100%'}}>
            <FullScreen handle={handle}>
                <IdleTimeout
                    Status={props.StreamerStatus}
                    WarningThreshold={1500}
                    ExitThreshold={600}
                    WarningCallback={handle.exit}
                    ExitCallback={() => window.location.reload()} // TODO: How to 'close' a contribution?
                />

                <LoadingView setAvatarValue={props.setAvatarValue} LaunchRequestStatus={props.LaunchRequestStatus}
                             StreamerStatus={props.StreamerStatus}/>
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
                    style={{position: 'absolute', top: 10, right: 10}}
                    className={isIPhone || handle.active || props.StreamerStatus !== StreamerStatus.Connected ? 'hidden' : ''}>
                    <Icon name="expand"/>
                </Button>

                {props.StreamerStatus !== StreamerStatus.Connected && (
                    <img
                        alt="Aftermathislands Logo"
                        src="/aftermathislands.svg"
                        style={{width: 100, position: 'absolute', bottom: 50, right: 10}}
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
clientOptions.ModelId = client.modelId;
clientOptions.Version = client.version;
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
platform.initialize({endpoint: clientOptions.Endpoint || 'https://api.pureweb.io'});

const defaultModelDefinition = new ModelDefinition();
defaultModelDefinition.id = clientOptions.ModelId!;
defaultModelDefinition.active = true;
defaultModelDefinition.version = clientOptions.Version!;
defaultModelDefinition.projectId = clientOptions.ProjectId!;

const App: React.FC = () => {
    //const ab=document.getElementById('videoOfBackground') as HTMLVideoElement;
    const [playername, setPlayerName] = useState("");
    const [gameToken, setGameToken] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [modelDefinitionUnavailable, setModelDefinitionUnavailable] = useState(false);
    const [modelDefinition, setModelDefinition] = useState(defaultModelDefinition);
    const [availableModels, setAvailableModels] = useState<ModelDefinition[]>();
    const [launchRequestError, setLaunchRequestError] = useState<Error>();
    const streamerOptions = DefaultStreamerOptions;
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
        setupPlatform();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function setupPlatform() {
        console.log('setupPlatform');
        if (clientOptions.ProjectId) {
            logger.info('Initializing available models: ' + clientOptions.ProjectId);
            try {
                await platform.useAnonymousCredentials(clientOptions.ProjectId, clientOptions.EnvironmentId);
                await platform.connect();
                logger.info('Agent Connected: ' + platform.agent.id);
                streamerOptions.iceServers = platform.agent.serviceCredentials.iceServers as RTCIceServer[];
                streamerOptions.forceRelay = clientOptions.ForceRelay;
                const models = await platform.getModels();
                console.log('available models');
                console.log(models);
                setAvailableModels(models);
                logger.debug('Available models', models);
            } catch (err) {
                logger.error(err);
            }
        }
    }

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
            console.log('selected Models');
            console.log(selectedModels);
            if (selectedModels?.length) {
                console.log('set model definition');
                console.log(selectedModels[0]);
                let modelDef = JSON.parse(JSON.stringify(selectedModels[0]));
                console.log(modelDef);
                setModelDefinition(modelDef);
            } else {
                console.log('set model unavailable');
                setModelDefinitionUnavailable(true);
            }
        }
    }, [availableModels]);



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

        // send player name to the game - when not testing (old login) OR when testing, but it is guest login
        if (sessionStorage.getItem('is_guest_login') === 'true') {
            //set player name----------------------
            let nameInputElement = document.getElementById("playername") as HTMLInputElement;
            console.log('set player name here');
            console.log(nameInputElement);
            setPlayerName(nameInputElement.value);
        } else {
           console.log("player name is loaded form AB")
        }

        if (clientOptions.LaunchType !== 'local') {
            try {
                await setupPlatform();

                let interval = setInterval(launchPlatform, 300); // 2000 ms = start after 2sec
                // @ts-ignore
                function launchPlatform() {
                    console.log('platform');
                    console.log(platform);
                    console.log('availableModels');
                    console.log(availableModels);
                    console.log('modelDefinition');
                    console.log(modelDefinition);
                    if (availableModels?.length) {
                        console.log('queue launch request');
                        queueLaunchRequest();
                        clearInterval(interval);
                    }
                }

            } catch (err) {
                setLaunchRequestError(err as any);
            }
        }
    };

    const passGameCode = (code: string) => {
        setGameToken(code);
    }

    const el = document.getElementById('videoOfBackground') as HTMLVideoElement;

    // Log status messages
    useEffect(() => {


        logger.info('Status', status, streamerStatus);

        // send game token
        if (gameToken.length > 0) {
            console.log('code right here', gameToken);
            emitter.EmitUIInteraction("gametoken=" + gameToken);
            logger.info("gametoken===" + gameToken);
        }


        //send player username
        if (playername.length > 0) {
            emitter.EmitUIInteraction("playername=" + playername);
            logger.info("playername===" + playername);
        }
        else{
            logger.info("playername empty" );
        }


        //stop and hide video
        if (streamerStatus === "Connected") {

            if (el != null) {
                el.pause();
                el.volume = 0;
                el.remove();
            }

            logger.info("i am connected");
        }

        //check user platform
        if (isMobile) {
            emitter.EmitUIInteraction("mobile");
            logger.info(browserName);
        } else {
            logger.info("its a desktop ");
            logger.info(browserName);
        }


        //send avatar url
        emitter.EmitUIInteraction(avatarUrl);
        logger.info(avatarUrl);


    }, [el, avatarUrl, emitter, status, streamerStatus, playername, gameToken]);

    // Subscribe to game messages
    useEffect(() => {
        const subscription = messageSubject.subscribe(
            (value: string) => {
                if ((value.includes("https://")) && (!(value.includes("glb")))) {
                    window.open(value);
                    logger.info(value);
                } else {
                    logger.info("not weblink");
                }

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
                    <a href="https://www.npmjs.com/package/@pureweb/cra-template-pureweb-client"> README </a> for
                    details on how
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
                setAvatarValue={setAvatarUrl}
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
        return <LaunchView Launch={launch} GameCode={passGameCode}/>;
    }
};

const AppWrapper: React.FC = () => {
    return System.IsBrowserSupported() ? (
        <App/>
    ) : (
        <div className="ui red segment center aligned basic">
            <h2 className="header">Your browser is currently unsupported</h2>
        </div>
    );
};

export default AppWrapper;
