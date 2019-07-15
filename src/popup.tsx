import * as React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { LSIFTypeScriptExtensionsChannel, wsAddress } from './constants';
import { logger } from './logger';

const Container = styled.div`
    width: 300px;
    height: 150;
    background-color: #fff;
`;

class App extends React.Component {
    state = {
        connectStatus: null,
    }

    constructor(props) {
        super(props);

        chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
            if (port.name === LSIFTypeScriptExtensionsChannel) {
                port.onMessage.addListener((message) => {
                    logger.info(message);
                    if (message.event) {
                        this.setState({ connectStatus: message.event });
                    }
                });
            }
        });
    }

    render() {
        return (
            <Container>
                {this.state.connectStatus}
                {wsAddress}
            </Container>
        );
    }
}

render(
    <App />,
    document.querySelector('#app')
);
