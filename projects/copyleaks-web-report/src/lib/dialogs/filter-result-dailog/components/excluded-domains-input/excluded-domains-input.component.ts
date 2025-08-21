import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { FilterResultDailogService } from '../../services/filter-result-dailog.service';
import { trigger, transition, animate, keyframes, style } from '@angular/animations';

@Component({
	selector: 'cr-excluded-domains-input',
	templateUrl: './excluded-domains-input.component.html',
	styleUrls: ['./excluded-domains-input.component.scss'],
	animations: [
		trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('0.5s', style({ opacity: 1 }))])]),
		trigger('errorAnimation', [
			transition(':enter', [
				animate(
					'0.5s ease-in',
					keyframes([
						style({ transform: 'translateY(-10px)', offset: 0.1 }),
						style({ transform: 'translateY(0px)', offset: 0.2 }),
						style({ transform: 'translateY(-10px)', offset: 0.3 }),
						style({ transform: 'translateY(0px)', offset: 0.4 }),
						style({ transform: 'translateY(-10px)', offset: 0.5 }),
						style({ transform: 'translateY(0px)', offset: 1.0 }),
					])
				),
			]),
		]),
	],
	standalone: false,
})
export class ExcludedDomainsInputComponent implements OnInit {
	addDomainControl = new UntypedFormControl('');
	excludedDomainsForm: UntypedFormControl;
	errorMessage: string;

	get excludedDomainsFormValue() {
		return this.excludedDomainsForm.value as string[];
	}

	constructor(private _filterService: FilterResultDailogService) {}

	ngOnInit(): void {
		this.excludedDomainsForm = this._filterService.excludedDomainsFormControl;
	}

	addDomain() {
		const domain = this.addDomainControl.value;
		if (!domain) {
			// update the errorMessage text to demand a non empty domain
			this.errorMessage = 'Please enter a domain';
			return;
		}
		// check if the domain is already in the excludedDomainsForm value
		// if it is, return
		if (this.excludedDomainsForm.value?.includes(domain)) {
			this.errorMessage = 'Domain already exists';
			return;
		}
		// check if the domain is a valid domain
		// if it is not, return and update the errorMessage text to demand a valid domain or subdomain or url
		if (!this.isValidUrl(domain) && !this.isValidDomain(domain) && !this.isValidSubdomain(domain)) {
			this.errorMessage = 'Please enter a valid domain or subdomain or url';
			return;
		}
		// update the errorMessage text to an empty string
		this.errorMessage = '';
		this.excludedDomainsForm.setValue([...(this.excludedDomainsForm.value ?? []), domain]);

		this.addDomainControl.setValue('');
	}

	removeDomain(domain: string) {
		if (!domain) return;
		// update the excludedDomainsForm value by removing the domain from its value
		this.excludedDomainsForm.setValue((this.excludedDomainsForm.value ?? []).filter((d: string) => d !== domain));
		this.errorMessage = '';
	}

	isValidUrl(url: string): boolean {
		const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+.*)$/;
		return urlRegex.test(url);
	}

	isValidDomain(domain: string): boolean {
		const domainRegex = /^([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)$/;
		return domainRegex.test(domain);
	}

	isValidSubdomain(subdomain: string): boolean {
		const subdomainRegex = /^([a-zA-Z0-9-]+\.)*([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)$/;
		return subdomainRegex.test(subdomain);
	}
}
