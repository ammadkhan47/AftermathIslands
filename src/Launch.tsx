import React, {useEffect, useState} from 'react';
import {Button} from 'semantic-ui-react';

import './Launch.css';
import clientConfig from './client.json';
import axios from 'axios';
import pkceChallenge from 'pkce-challenge';
import queryString from 'query-string';

const client: ClientJson = clientConfig as ClientJson;

let nameInput;

class ClientJson {
    description?: string = 'description';
    title?: string = 'title';
}

interface LaunchProps {
    Launch: () => void;
    GameCode: (code: string) => void;
}

class AccelbyteAuth {
    static baseURL?: string = process.env.REACT_APP_ACCELBYTE_API
    static clientId?: string = process.env.REACT_APP_ACCELBYTE_AUTH_CLIENT_ID
    static namespace?: string = process.env.REACT_APP_ACCELBYTE_AUTH_NAMESPACE
    static platformId?: string = process.env.REACT_APP_ACCELBYTE_AUTH_PLATFORM_ID
    static exchangeNamespace?: string = process.env.REACT_APP_ACCELBYTE_AUTH_EXCHANGE_NAMESPACE
    static exchangeClientId?: string = process.env.REACT_APP_ACCELBYTE_AUTH_EXCHANGE_CLIENT_ID
}

class LiquidAvatarAuth {
    static baseURL?: string = process.env.REACT_APP_LIQUID_AVATAR_API
    static redirectURL?: string = process.env.REACT_APP_LIQUID_AVATAR_REDIRECT_URI
    static clientId?: string = process.env.REACT_APP_LIQUID_AVATAR_CLIENT_ID
    static clientSecret?: string = process.env.REACT_APP_LIQUID_AVATAR_CLIENT_SECRET
}

export const LaunchView: React.FC<LaunchProps> = (props: LaunchProps) => {

    const [codeChallenge, setCodeChallenge] = useState(sessionStorage.getItem('code_challenge') || '');
    const [codeVerifier, setCodeVerifier] = useState(sessionStorage.getItem('code_verifier') || '');

    useEffect(() => {
        unhideLogin();
        setupLoginWithOpenIDConnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (

        <div id="launchContainer">
            <div id="login-buttons-wrap">
                <div id="login-left" style={{zIndex: 20}}>
                    <h2 id="login-heading">Try it out with <br></br> limited functionality</h2>
                    <h1>{client.description}</h1>
                    <Button size="massive" color="green" circular icon="play" onClick={playButton}></Button>
                    <p id="NameDescription"></p>
                    <input type="text" placeholder="Enter Username" name="nameInput" id="playername"/>
                </div>
                <div id="login-middle">
                    <h2>OR</h2>
                </div>
                <div id="login-right">
                    <form autoComplete="off" action={LiquidAvatarAuth.baseURL + '/auth'} method="post">
                        <h2>Login with your <br></br> Meta ParkPass ™</h2>
                        <input required type="text" hidden name="client_id" value={LiquidAvatarAuth.clientId}/>
                        <input required type="text" hidden name="response_type" value="code"/>
                        <input required type="text" hidden name="response_mode" value="query"/>
                        <input required type="text" hidden name="redirect_uri" value={LiquidAvatarAuth.redirectURL}/>
                        <input type="text" hidden name="code_challenge" value={codeChallenge}/>
                        <input type="text" hidden name="code_challenge_method" value="S256"/>
                        <input required hidden type="text" name="scope" value="openid profile"/>
                        <Button type="submit" size="massive" color="blue" circular>
                            <img alt="Liquid Avatar Logo " src="/Liquid-Avatar-Logo-thumb-v1.png"/>
                        </Button>
                    </form>

                </div>
            </div>

            <img alt="Aftermathislands Logo" src="/aftermathislands.svg"
                 style={{width: 100, position: 'absolute', bottom: 50, right: 10}}/>

            <img alt="Aftermathislands Logo" src="/Navlogo.png" style={{
                width: '370px',
                height: '130px',
                position: 'absolute',
                top: 80,
                right: 0,
                left: 0,
                margin: 'auto',
            }}/>

            <img className='navcontrols' alt="Navigation Controls" src="/Navcontrols.png" style={{
                width: '400px',
                height: '189px',
                position: 'absolute',
                bottom: 60,
                right: 0,
                left: 0,
                margin: 'auto',
            }}/>

            <div><p style={{
                fontSize: '10',
                position: 'absolute',
                bottom: 20,
                right: 0,
                left: 0,
                margin: 'auto',
                color: 'white',
            }}>By proceeding you agree to the Aftermath Islands Metaverse Terms and Conditions and Privacy Policy
                located at aftermathislands.com</p></div>


        </div>

    );

    function unhideLogin() {
        const loginLeft = document.getElementById("login-left") as HTMLElement;
        const loginMiddle = document.getElementById("login-middle") as HTMLElement;
        const loginRight = document.getElementById("login-right") as HTMLElement;
        if (!(window.location.href.includes("testing")) || (window.location.href.includes("code"))) {
            loginMiddle.style.display = "none";
            loginRight.style.display = "none";
        } else {
            loginLeft.style.display = "none";
            loginMiddle.style.display = "none";
        }
    }

    async function playButton() {
        nameInput = document.getElementById("playername") as HTMLInputElement;

        if (nameInput.value.length > 0) {

            if (window.location.href.includes("testing")) {
                let accelbyteAccessToken = sessionStorage.getItem('accelbyte_access_token')!;
                await patchAccelbyteUser(accelbyteAccessToken, { 'displayName': nameInput.value});
            }

            props.Launch();
            var foobarElement = document.getElementById('mybody') as HTMLBodyElement;
            foobarElement.style.background = '#0f101f';
        }
    }

    async function setupLoginWithOpenIDConnect() {
        // check if we have an OpenID Connect authorization code in the URL
        let queryParameters = new URLSearchParams(window.location.search);
        let authorizationCode = queryParameters.get("code");

        // if we have one, we proceed to log in with it
        if (authorizationCode) {
            let oidcResult = await getOpenIDToken(authorizationCode);
            let oidcIDToken = oidcResult['id_token'];
            let oidcAccessToken = oidcResult['access_token'];
            removeUrlParameter('code');
            removeUrlParameter('iss');
            const loginheading = document.getElementById("login-heading") as HTMLHeadingElement;
            loginheading.textContent = "All data from all accounts created with a Meta Park Pass including username and inventories will be deleted when the Beta ends.";

            if (oidcResult) {
                let accelbyteAccessData = await getAccelbyteAccessToken(oidcIDToken);
                let accelbyteAccessToken = accelbyteAccessData['access_token'];
                let openIDUserId = accelbyteAccessData['platform_user_id'];
                sessionStorage.setItem('accelbyte_access_token', accelbyteAccessToken);

                let accelbyteUserData = await getAccelbyteUser(accelbyteAccessToken);
                await getGameCode(accelbyteAccessToken);
                if (accelbyteUserData) {
                    let isExistingUser = !!accelbyteUserData['userName'];
                    if (!isExistingUser) {
                        // new user -> save uuid and birthdate
                        let oidcUserData = await getOpenIDUserData(oidcAccessToken);
                        let patchData = {
                            'userName': openIDUserId,
                            'dateOfBirth': oidcUserData['birthdate'] || ''
                        };
                        await patchAccelbyteUser(accelbyteAccessToken, patchData);
                    } else {
                        // const loginContainer = document.getElementById("login-buttons-wrap") as HTMLElement;
                        // loginContainer.style.display = "none";
                        // setTimeout(function () {
                        //     props.Launch();
                        //     var foobarElement = document.getElementById('mybody') as HTMLBodyElement;
                        //     foobarElement.style.background = '#0f101f';
                        // }, 3000);
                    }
                } else {
                    // todo throw some error
                }
            }
        } else {
            // setup pkce for future use
            let challenge = pkceChallenge();
            sessionStorage.setItem('code_challenge', challenge.code_challenge);
            sessionStorage.setItem('code_verifier', challenge.code_verifier);
        }

        let codeChallenge = sessionStorage.getItem('code_challenge');
        let codeVerifier = sessionStorage.getItem('code_verifier');

        setCodeChallenge(codeChallenge!);
        setCodeVerifier(codeVerifier!);
    }

    async function getOpenIDToken(authorizationCode: string) {
        let response = await axios.post(`${LiquidAvatarAuth.baseURL}/token`, queryString.stringify({
            'grant_type': 'authorization_code',
            'code': authorizationCode,
            'code_verifier': codeVerifier,
            'client_id': LiquidAvatarAuth.clientId,
            'redirect_uri': LiquidAvatarAuth.redirectURL
        }), {
            auth: {
                username: LiquidAvatarAuth.clientId!,
                password: LiquidAvatarAuth.clientSecret!
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log(response.status);
        console.log(response.data);

        return response.status === 200 ? response.data : '';
    }


    async function getOpenIDUserData(accessToken: string) {
        let response = await axios.post(`${LiquidAvatarAuth.baseURL}/me`, queryString.stringify({
        }), {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log(response.status);
        console.log(response.data);

        return response.status === 200 ? response.data : '';
    }

    async function getAccelbyteAccessToken(openIDToken: string) {
        let response = await axios.post(`${AccelbyteAuth.baseURL}/iam/v3/oauth/platforms/${AccelbyteAuth.platformId}/token`, queryString.stringify({
            'client_id': AccelbyteAuth.clientId,
            'platform_token': openIDToken
        }), {
            auth: {
                username: AccelbyteAuth.clientId!,
                password: ''
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.status === 200 ? response.data : '';
    }

    async function getAccelbyteUser(accessToken: string) {
        let response = await axios.get(`${AccelbyteAuth.baseURL}/iam/v3/public/users/me`,
            {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });

        return response.status === 200 ? response.data : '';
    }

    async function patchAccelbyteUser(accessToken: string, patchData: object) {
        let response = await axios.patch(`${AccelbyteAuth.baseURL}/iam/v3/public/namespaces/${AccelbyteAuth.namespace}/users/me`,
            patchData, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });

        return response.status === 200 ? response.data : '';
    }

    async function getGameCode(accessToken: string) {
        let response = await axios.post(`${AccelbyteAuth.baseURL}/iam/v3/namespace/${AccelbyteAuth.exchangeNamespace}/token/request`,
            queryString.stringify({
                'client_id': AccelbyteAuth.exchangeClientId
            }), {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

        console.log(response.status);
        console.log(response.data);

        if (response.status === 200) {
            let data = response.data;
            let gameCode = data['code'];
            props.GameCode(gameCode);

            let queryParameters = new URLSearchParams(window.location.search)
            let modelId = queryParameters.get("modelId")
            let version = queryParameters.get("version")
            console.log('modelId after getting game code');
            console.log(modelId);
            console.log('version after getting game code');
            console.log(version);
        }

    }

    function removeUrlParameter(paramKey: string) {
        const url = window.location.href;
        console.log("url", url);
        let r = new URL(url);
        r.searchParams.delete(paramKey);
        const newUrl = r.href;
        console.log("r.href", newUrl);
        window.history.pushState({path: newUrl}, '', newUrl);
    }


};
