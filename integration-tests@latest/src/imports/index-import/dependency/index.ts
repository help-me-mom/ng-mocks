export class DependencyComponent {

    public dependOnMe(): string {

        return "I'm in a file named index.ts";
    }
}

export class DependencyComponentWithSlash {

    public dependOnMe(): string {

        return "I was required using a trailing slash";
    }
}
