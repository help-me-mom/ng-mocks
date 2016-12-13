import * as corejs from "core-js";
import moment from "moment";

export class ExportsComponent {

    public format(date: Date): string {

        return moment(date).format("YYYY-MM-DD");
    }

    public hasMap(): boolean {

        return corejs.Map != undefined;
    }
}
