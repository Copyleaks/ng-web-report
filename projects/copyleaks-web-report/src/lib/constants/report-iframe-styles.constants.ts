export const COPYLEAKS_REPORT_IFRAME_STYLES: string = `
@import url('https://p.typekit.net/p.css?s=1&k=ieb7ycr&ht=tk&f=34762.34763.34771.34772&a=120129709&app=typekit&e=css');

@font-face {
	font-family: 'haboro-soft';
	src: url('https://use.typekit.net/af/ef3c52/00000000000000007735ad5b/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n2&v=3')
			format('woff2'),
		url('https://use.typekit.net/af/ef3c52/00000000000000007735ad5b/30/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n2&v=3')
			format('woff'),
		url('https://use.typekit.net/af/ef3c52/00000000000000007735ad5b/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n2&v=3')
			format('opentype');
	font-display: auto;
	font-style: normal;
	font-weight: 200;
	font-stretch: normal;
}

@font-face {
	font-family: 'haboro-soft';
	src: url('https://use.typekit.net/af/521a26/00000000000000007735ad5e/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i2&v=3')
			format('woff2'),
		url('https://use.typekit.net/af/521a26/00000000000000007735ad5e/30/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i2&v=3')
			format('woff'),
		url('https://use.typekit.net/af/521a26/00000000000000007735ad5e/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i2&v=3')
			format('opentype');
	font-display: auto;
	font-style: italic;
	font-weight: 200;
	font-stretch: normal;
}

@font-face {
	font-family: 'haboro-soft';
	src: url('https://use.typekit.net/af/c99e0e/00000000000000007735ad79/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
			format('woff2'),
		url('https://use.typekit.net/af/c99e0e/00000000000000007735ad79/30/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
			format('woff'),
		url('https://use.typekit.net/af/c99e0e/00000000000000007735ad79/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
			format('opentype');
	font-display: auto;
	font-style: normal;
	font-weight: 700;
	font-stretch: normal;
}

@font-face {
	font-family: 'haboro-soft';
	src: url('https://use.typekit.net/af/90ed13/00000000000000007735ad7b/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3')
			format('woff2'),
		url('https://use.typekit.net/af/90ed13/00000000000000007735ad7b/30/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3')
			format('woff'),
		url('https://use.typekit.net/af/90ed13/00000000000000007735ad7b/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3')
			format('opentype');
	font-display: auto;
	font-style: italic;
	font-weight: 700;
	font-stretch: normal;
}

@font-face {
	font-family: 'haboro-soft';
	src: url('https://use.typekit.net/af/203813/00000000000000007735ad69/30/l?subset_id=2&fvd=i5&v=3') format('woff2'),
		url('https://use.typekit.net/af/203813/00000000000000007735ad69/30/d?subset_id=2&fvd=i5&v=3') format('woff'),
		url('https://use.typekit.net/af/203813/00000000000000007735ad69/30/a?subset_id=2&fvd=i5&v=3') format('opentype');
	font-display: auto;
	font-style: italic;
	font-weight: 500;
	font-stretch: normal;
}

@font-face {
	font-family: 'haboro-soft';
	src: url('https://use.typekit.net/af/afca7d/00000000000000007735ad6c/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3')
			format('woff2'),
		url('https://use.typekit.net/af/afca7d/00000000000000007735ad6c/30/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3')
			format('woff'),
		url('https://use.typekit.net/af/afca7d/00000000000000007735ad6c/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3')
			format('opentype');
	font-display: auto;
	font-style: normal;
	font-weight: 500;
	font-stretch: normal;
}

.tk-haboro-soft {
	font-family: 'haboro-soft', sans-serif;
}

::-moz-selection {
	background: #b4d7fe !important;
	border-radius: 2px !important;
}

::selection {
	background: #b4d7fe !important;
	border-radius: 2px !important;
}

body,
html {
	user-select: text;
	-webkit-user-select: text;
	-moz-user-select: text;
	-ms-user-select: text;
}

html {
	padding: 4px;
}
::-webkit-scrollbar {
	width: 8px;
	height: 8px !important;
}
::-webkit-scrollbar-track {
	border-radius: 4px;
	transform: matrix(0, 1, -1, 0, 0, 0);
	background: #ebf3f5;
	border: 1px solid #fbffff;
}
::-webkit-scrollbar-thumb {
	border-radius: 4px !important;
	background: rgba(17, 41, 96, 0.4) !important;
	box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.27) !important;
}
#sidebar.opened + #page-container {
	left: 0px !important;
}
#page-container {
	.c {
		pointer-events: none !important;
	}
	.t {
		pointer-events: all !important;
	}
}
span[exclude] {
	position: relative;
	font-style: normal !important;
	opacity: 1 !important;
	color: #0b163e !important;
	cursor: pointer;
	border-radius: 2px;
	border-bottom: 2px dashed #3f9af5 !important;
	background: rgba(63, 154, 245, 0.2) !important;
}
span[exclude-partial-scan] {
	position: relative;
	filter: blur(6px);
	cursor: pointer;
}
span[match] {
	cursor: pointer;
	color: #000;
	position: relative;
	border-radius: 2px !important;
}
span[match] a:link {
	pointer-events: none;
}
span[ignored] {
	font-style: italic;
}
span[match][data-type='0'] {
	background-color: #fd7366;
	transition: 0.2s;
}
span[match][data-type='0'].hover {
	background-color: #00e2a2;
}
span[match][data-type='1'] {
	background-color: #ffb1b1;
	transition: 0.2s;
}
span[match][data-type='1'].hover {
	background-color: #00e2a2;
}
span[match][data-type='2'] {
	background-color: #fed5a9;
	transition: 0.2s;
}
span[match][data-type='2'].hover {
	background-color: #00e2a2;
}
span[match][data-type='3'] {
	background-color: #ff9a02;
	transition: 0.2s;
}
span[match][data-type='3'].hover {
	background-color: #00e2a2;
}
span[match][data-type='6'] {
	background-color: #d7c5ff;
	transition: 0.2s;
}

span[match][data-type='4'] {
	background-color: #f8eaff;
	transition: 0.2s;
	pointer-events: none !important;
}

span[match][data-proportion='low'] {
	background-color: #d7c5ff !important;
	transition: 0.2s;
}

span[match][data-proportion='medium'] {
	background-color: #bca6ff !important;
	transition: 0.2s;
}

span[match][data-proportion='high'] {
	background-color: #a188ff !important;
	transition: 0.2s;
}

span[match][data-type='6'].hover {
	background-color: #00e2a2 !important;
}

span[match][on] {
	background-color: #00e2a2 !important;
}

span[match] .tooltip-match-content-container {
	min-width: 120px;
	max-width: 300px !important;
	position: absolute;
	z-index: 111111111111;
	bottom: 160%;
	left: 50%;
	transition: opacity 0.3s, transform 0.3s;
	display: flex;
	padding: 10px 18px;
	transform: translate(-50%, 0);
	justify-content: center;
	align-items: center;
	border-radius: 10px;
	background: #0b163e;
	color: #fbffff;
	flex-direction: row;
	gap: 16px;
	box-shadow: 0px 0px 10px 0px rgba(11, 22, 62, 0.12);
	border: none;
	box-sizing: border-box;
	transform-origin: 50% 100%;
	z-index: 999999999;
	word-spacing: normal !important;
	letter-spacing: normal !important;

	svg {
		display: block !important;
		height: 17px !important;
		width: 16px !important;
	}

	.correction-text,
	.wrong-text {
		font-size: 14px;
		font-style: normal;
		font-weight: 500;
		font-family: haboro-soft, sans-serif !important;
		display: block;
		max-width: 100%;
		white-space: nowrap;
		line-height: normal;
		text-overflow: ellipsis;
		overflow: hidden;
		max-width: 100%;
		word-spacing: normal !important;
		letter-spacing: normal !important;
	}
	.wrong-text {
		text-decoration: line-through;
		text-decoration-color: #d04340;
	}
	.correction-text {
		color: #ff9a02;
	}
}

span[exclude] .excluded-reason-tooltip,
span[exclude-partial-scan] .excluded-reason-tooltip {
	position: absolute;
	width: 220px;
	height: auto;
	display: flex;
	justify-content: center;
	opacity: 1;
	transition: opacity 0.3s, transform 0.3s;
	z-index: 111111111111;
	bottom: 160%;
	left: 50%;
	border-radius: 4px;
	background: #112960;
	padding: 8px;
	color: #fbffff;
	font-family: haboro-soft, sans-serif !important;
	font-size: 14px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
	word-spacing: normal !important;
	letter-spacing: normal !important;
	line-break: normal;
	white-space: normal;
}

span.copyleaks-highlight {
	background-color: #ffdf54;
	cursor: pointer;
	transition: 0.2s ease-in-out;
	border-radius: 2px !important;

	&:hover,
	&.hover,
	&.selected {
		background-color: #00e2a2;
	}
}

span[match] .tooltip-match-content-container::after {
	content: '';
	position: absolute;
	top: 100%;
	left: 50%;
	margin-inline-start: -5px;
	border-width: 7px;
	border-style: solid;
	border-color: #112960 transparent transparent transparent;
}

span[match] .tooltip-match-content-container.right-arrow::after {
	content: '';
	position: absolute;
	top: 50% !important;
	left: 100% !important;
	margin: 0px !important;
	margin-top: -5px !important;
	border-width: 7px;
	border-style: solid;
	border-color: transparent transparent transparent #112960;
}

span[match] .tooltip-match-content-container.left-arrow::after {
	content: '';
	position: absolute;
	top: 50% !important;
	right: 100% !important;
	left: auto !important;
	margin: 0px !important;
	margin-top: -5px !important;
	border-width: 7px;
	border-style: solid;
	border-color: transparent #112960 transparent transparent;
}

.cls-add-annotation-btn {
	position: absolute;
	z-index: 999999999;
	border-radius: 56px;
	background: var(--Colors-Main-Blue, #3f9af5);
	box-shadow: 0px 0px 4px 0px rgba(63, 154, 245, 0.4), 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
	padding: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	cursor: pointer;
	color: #fbffff;
	transition: 0.4s ease-in-out;

	svg {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}
	&:hover {
		background: #fbffff;

		svg {
			path {
				color: #3f9af5 !important;
				fill: #3f9af5 !important;
			}
		}
	}
}

.copyleaks-custom-tooltip {
	position: absolute !important;
	background: #616161 !important;
	color: white !important;
	border-radius: 4px !important;
	font-size: 12px !important;
	opacity: 0;
	transform: scale(0);
	transform-origin: center top;
	transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
	pointer-events: none !important;
	white-space: nowrap !important;
	min-width: 120px !important;
	text-align: center !important;
	box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12) !important;
	word-spacing: normal !important;
	font-family: haboro-soft, sans-serif !important;
	font-size: 14px !important;
	font-weight: 500 !important;
	color: #fbffff !important;
	background-color: #112960 !important;
	border-radius: 4px !important;
	padding: 8px !important;
	white-space: pre-line !important;
	z-index: 999999999 !important;
	line-height: normal !important;
}

.copyleaks-custom-tooltip-trigger:hover .copyleaks-custom-tooltip {
	opacity: 1;
	transform: scale(1) translateY(8px);
}

.copyleaks-custom-tooltip {
	left: 50%;
	bottom: 170%;
	transform: translateX(-50%);
}

.copyleaks-custom-tooltip-trigger:hover .copyleaks-custom-tooltip {
	transform: translateX(-50%) scale(calc(1 / var(--iframe-scale, 1))) translateY(8px);
}

@media screen {
	.copyleaks-custom-tooltip {
		transform: translateX(-50%) scale(calc(1 / var(--iframe-scale, 1)));
		transform-origin: center bottom;
	}
}

`;
