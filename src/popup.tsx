import * as React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

const Container = styled.div`
    width: 300px;
    height: 300px;
    background-color: #ff004f;
`;

class App extends React.Component {
    render() {
        return (
            <Container>
                {/** todo */}
            </Container>
        );
    }
}

render(
    <App />,
    document.querySelector('#app')
);
