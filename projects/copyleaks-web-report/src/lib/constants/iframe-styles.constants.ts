export const COPYLEAKS_REPORT_IFRAME_STYLES: string = `
html {
	padding: 4px;
	overflow-x: hidden;
}
::-webkit-scrollbar {
	width: 8px;
	height: 8px !important;
}
::-webkit-scrollbar-track {
	border-radius: 4px;
	transform: matrix(0, 1, -1, 0, 0, 0);
	background: #fbffff;
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
	font-style: italic;
	opacity: 0.75;
}
span[exclude-partial-scan] {
	filter: blur(6px);
	cursor: pointer;
}
span[match] {
	cursor: pointer;
	color: #000;
}
span[match] a:link {
	pointer-events: none;
}
span[ignored] {
	font-style: italic;
}
span[match][data-type='0'] {
	background-color: #fd7366;
}
span[match][data-type='0'].hover {
	background-color: #ff887a;
}
span[match][data-type='1'] {
	background-color: #fe9391;
}
span[match][data-type='1'].hover {
	background-color: #ff9ea4;
}
span[match][data-type='2'] {
	background-color: #fed5a9;
}
span[match][data-type='2'].hover {
	background-color: #ffe3bd;
}
span[match][on] {
	background-color: gold !important;
}

`;
