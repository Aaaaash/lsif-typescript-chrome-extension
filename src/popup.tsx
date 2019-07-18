import * as React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

import { ExtensionWindow } from './types';
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
    }

    constructor(props) {
        super(props);
        logger.debug('Render');
        chrome.runtime.getBackgroundPage((backgroundPage) => {
            this.setState({ connectStatus: (backgroundPage as ExtensionWindow).getConnectStatus() });
        });
    }

    render() {
        return (
            <Container>
                {this.state.connectStatus || 'unknow'}
                <br />
                {wsAddress}
            </Container>
        );
    }
}

render(
    <App />,
    document.querySelector('#app')
);
