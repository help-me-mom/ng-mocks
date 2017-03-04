import * as React from "react";

export interface ReactComponentProps {
    compiler: string;
    framework: string;
}

export default class ReactTester extends React.Component<ReactComponentProps, {}> {

    public render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}
