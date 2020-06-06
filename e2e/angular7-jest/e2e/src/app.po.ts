import { browser, by, element } from 'protractor';

export class AppPage {
    navigateTo() {
        return browser.get(browser.baseUrl);
    }

    getCompany() {
        return element(by.css('[data-role="company"]')).getText();
    }

    getUsers() {
        return element(by.css('[data-role="users"]')).getText();
    }

    clickButton(role: string) {
        return element(by.css(`button[data-role="${role}"]`)).click();
    }
}
