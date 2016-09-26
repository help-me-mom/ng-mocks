import * as React from "react";

// comment

export interface HelloProps {
    compiler: string;
    framework: string;
}

export default class Hello extends React.Component<HelloProps, {}> {

    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }

    greet() { return "greetings!" }
}
