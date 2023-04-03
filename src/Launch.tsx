import React from 'react';
import {Button} from 'semantic-ui-react';

import './Launch.css';
import clientConfig from './client.json';
import axios from 'axios';

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
    static codeChallenge?: string = process.env.REACT_APP_ACCELBYTE_AUTH_CODE_CHALLENGE

}

export const LaunchView: React.FC<LaunchProps> = (props: LaunchProps) => {
    let queryParameters = new URLSearchParams(window.location.search)
    let code = queryParameters.get("code")
    let state = queryParameters.get("state")

    if (code && state) {
        axios.post(`${AccelbyteAuth.baseURL}/iam/v3/oauth/authorize`, {
            'code': code,
            'state': state,

        })
            .then(res => {
                console.log(res.status);
                console.log(res.data);

            })
    }


    return (
        <div id="launchContainer">


            <div style={{zIndex: 20}}>
                <h1>{client.description}</h1>


                <Button size="massive" color="green" circular icon="play" onClick={playbtn}></Button>
                <p id="NameDescription"></p>
                <input type="text" placeholder="Enter Username" name="nameInput" id="playername"/>
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

};
