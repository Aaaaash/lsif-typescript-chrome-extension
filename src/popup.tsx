import * as React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

import { ExtensionWindow, ServerConnectStatus } from './types';
import { TypeScriptExtensionsChannel, wsAddress } from './constants';
import { logger } from './logger';

const Container = styled.div`
    width: 300px;
    height: 150;
    background-color: #fff;
`;

class App extends React.Component {
    state = {
        connectStatus: null,
        retrying: false,
    }

    constructor(props) {
        super(props);
        logger.debug('Render');
        chrome.runtime.getBackgroundPage((backgroundPage) => {
            this.setState({ connectStatus: (backgroundPage as ExtensionWindow).getConnectStatus() });
        });
    }

    handleReconnect = () => {
        this.setState({ retrying: true });
        chrome.extension.sendRequest({ event: 'RECONNECT' }, (response) => {
            if (response.event === 'RECONNECT_SUCCESS') {
                this.setState({ retrying: false });
            }
        });
    }

    render() {
        const { connectStatus, retrying } = this.state;

        return (
            <Container>
                {connectStatus || 'unknow'}
                <br />
                {wsAddress}
                {connectStatus === ServerConnectStatus.disconnect && <button onClick={this.handleReconnect}>reconnect</button>}
                {retrying && <span>Retrying...</span>}
            </Container>
        );
    }
}

render(
    <App />,
    document.querySelector('#app')
);
