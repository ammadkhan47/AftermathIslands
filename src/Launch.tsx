import React from 'react';
import { Button } from 'semantic-ui-react';

import './Launch.css';
import clientConfig from './client.json';
const client: ClientJson = clientConfig as ClientJson;

//let nameInput;

class ClientJson {
  description?: string = 'description';
  title?: string = 'title';
}

interface LaunchProps {
  Launch: () => void;
}

export const LaunchView: React.FC<LaunchProps> = (props: LaunchProps) => {
  return (
    <div id="launchContainer">
      <div>
        <h1>{client.description}</h1>

        

        <Button size="massive" color="green" circular icon="play" onClick={playbtn}></Button>
      </div>
          <img alt="Aftermathislands Logo" src="/aftermathislands.svg" style={{ width: 100, position: 'absolute', bottom: 50, right: 10 }} />
    </div>
  );
  function playbtn(){
    //nameInput=document.getElementById("playername") as HTMLInputElement;  <input type="text" name="nameInput" id="playername" />

    //if(nameInput.value.length>0){
      
      props.Launch();
      var foobarElement = document.getElementById('mybody') as HTMLBodyElement;
 foobarElement.style.background = '#0f101f';
    //}
  }
  
};
