import React from 'react';
import { Button } from 'semantic-ui-react';

import './Launch.css';
import clientConfig from './client.json';
const client: ClientJson = clientConfig as ClientJson;

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
        <Button size="massive" color="green" circular icon="play" onClick={() => props.Launch()}></Button>
      </div>
          <img alt="Aftermathislands Logo" src="/aftermathislands.svg" style={{ width: 100, position: 'absolute', bottom: 50, right: 10 }} />
    </div>
  );
};
