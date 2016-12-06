import moment from "moment";

export class ExportsComponent {

    public format(date: Date): string {

        return moment(date).format("YYYY-MM-DD");
    }
}
