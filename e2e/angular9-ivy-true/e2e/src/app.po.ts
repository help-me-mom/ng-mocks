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

    getFights() {
        return element(by.css('[data-role="fights"]')).getText();
    }

    getHeroes() {
        return element(by.css('[data-role="heroes"]')).getText();
    }

    getVillains() {
        return element(by.css('[data-role="villains"]')).getText();
    }

    clickButton(role: string) {
        return element(by.css(`button[data-role="${role}"]`)).click();
    }
}
