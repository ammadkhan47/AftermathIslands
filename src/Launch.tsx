import React from 'react';
import {Button} from 'semantic-ui-react';

import './Launch.css';
import clientConfig from './client.json';
import axios from 'axios';
import pkceChallenge from 'pkce-challenge';
import queryString from 'query-string';
import {v4 as uuid} from 'uuid';

const client: ClientJson = clientConfig as ClientJson;

let nameInput;

class ClientJson {
    description?: string = 'description';
    title?: string = 'title';
}

interface LaunchProps {
    Launch: () => void;
}

class AccelbyteAuth {
    static baseURL?: string = process.env.REACT_APP_ACCELBYTE_API
    static redirectURL?: string = process.env.REACT_APP_ACCELBYTE_AUTH_REDIRECT_URI
    static clientId?: string = process.env.REACT_APP_ACCELBYTE_AUTH_CLIENT_ID
    static exchangeNamespace?: string = process.env.REACT_APP_ACCELBYTE_AUTH_EXCHANGE_NAMESPACE
    static exchangeClientId?: string = process.env.REACT_APP_ACCELBYTE_AUTH_EXCHANGE_CLIENT_ID
}

export const LaunchView: React.FC<LaunchProps> = (props: LaunchProps) => {

    // check if we come from open id connect
    let queryParameters = new URLSearchParams(window.location.search)
    let code = queryParameters.get("code")
    let state = queryParameters.get("state")

    if (code && state) {
        if (state === sessionStorage.getItem('state')) {
            axios.post(`${AccelbyteAuth.baseURL}/iam/v3/oauth/token`, queryString.stringify({
                'grant_type': 'authorization_code',
                'code': code,
                'code_verifier': sessionStorage.getItem('code_verifier'),
                'client_id': AccelbyteAuth.clientId,
                'redirect_uri': AccelbyteAuth.redirectURL
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .then(res => {
                    console.log(res.status);
                    console.log(res.data);
                    if (res.status === 200) {
                        let data = res.data;
                        let accessToken = data['access_token'];
                        setTimeout(() => {
                            axios.post(`${AccelbyteAuth.baseURL}/iam/v3/namespace/${AccelbyteAuth.exchangeNamespace}/token/request`,
                                queryString.stringify({
                                    'client_id': AccelbyteAuth.exchangeClientId
                                }), {
                                    headers: {
                                        'Authorization': accessToken,
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                })
                                .then(res => {
                                    console.log(res.status);
                                    console.log(res.data);
                                })
                        }, 300);

                    }
                })
        }
    }

    return (
        <div id="launchContainer">
            <div style={{zIndex: 20}}>
                <h1>{client.description}</h1>
                <Button size="massive" color="green" circular icon="play" onClick={playbtn}></Button>
                <p id="NameDescription"></p>
                <input type="text" placeholder="Enter Username" name="nameInput" id="playername"/>
                <br></br>
                <br></br>
                <Button size="massive" color="blue" id="hide" circular onClick={loginWithAccelbyte}>
                    Login with Liquid Avatar 6
                </Button>
            </div>
            <img alt="Aftermathislands Logo" src="/aftermathislands.svg"
                 style={{width: 100, position: 'absolute', bottom: 50, right: 10}}/>

            <img alt="Aftermathislands Logo" src="/Navlogo.png" style={{
                width: '370px',
                height: '130px',
                position: 'absolute',
                top: 100,
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

    function playbtn() {
        nameInput = document.getElementById("playername") as HTMLInputElement;


        if (nameInput.value.length > 0) {

            props.Launch();
            var foobarElement = document.getElementById('mybody') as HTMLBodyElement;
            foobarElement.style.background = '#0f101f';
        }
    }

    function loginWithAccelbyte() {

        let challenge = pkceChallenge();
        let state = JSON.stringify({'csrf': uuid(), "payload": {'path': 'https://play.aftermathislands.com'}});
        sessionStorage.setItem('state', state);
        sessionStorage.setItem('code_challenge', challenge.code_challenge);
        sessionStorage.setItem('code_verifier', challenge.code_verifier);

        window.location.href = AccelbyteAuth.baseURL + '/iam/v3/oauth/authorize'
            + '?response_type=code'
            + '&code_challenge_method=S256'
            + '&createHeadless=true'
            + '&state=' + state
            + '&code_challenge=' + challenge.code_challenge
            + '&client_id=' + AccelbyteAuth.clientId
            + '&redirect_uri=' + AccelbyteAuth.redirectURL;
    }

};
