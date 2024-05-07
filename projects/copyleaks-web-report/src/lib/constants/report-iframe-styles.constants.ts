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
  &:hover {
		.omitted-text-title {
			visibility: visible;
		}
	}
  .omitted-text-title {
    font-family: haboro-soft, sans-serif !important;
		visibility: hidden;
		width: 80px;
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		padding: 2px;
		align-items: flex-start;
		gap: 10px;
		border-radius: 2px;
		background: #3F9AF5;
		color: #FBFFFF;
		font-size: 14px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
    z-index: 1000000;
	}
}
span[exclude-partial-scan] {
	filter: blur(6px);
	cursor: pointer;
}
span[match] {
	cursor: pointer;
	color: #000;
  position: relative;
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
	background-color: #00E2A2 ;
}
span[match][data-type='1'] {
	background-color: #FFB1B1;
  transition: 0.2s;
}
span[match][data-type='1'].hover {
	background-color: #00E2A2 ;
}
span[match][data-type='2'] {
	background-color: #fed5a9;
  transition: 0.2s;
}
span[match][data-type='2'].hover {
	background-color: #00E2A2 ;
}
span[match][data-type='3'] {
	background-color: #ff9a02;
  transition: 0.2s;
}
span[match][data-type='3'].hover {
	background-color: #00E2A2 ;
}
span[match][on] {
	background-color: #00E2A2  !important;
}

span[match] .tooltip-match-content-container {
  visibility: hidden;
  min-width: 120px;
  max-width: 300px !important;
  position: absolute;
  z-index: 1;
  bottom: 160%;
  left: 50%;
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  padding: 10px 18px;
  transform: translateX(-50%);
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
  }
  .wrong-text {
    text-decoration: line-through;
    text-decoration-color: #d04340;
  }
  .correction-text {
    color: #ff9a02;
  }
}

span[match] .tooltip-match-content-container::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 7px;
  border-style: solid;
  border-color: #112960 transparent transparent transparent;
}

span[match]:hover .tooltip-match-content-container {
  visibility: visible;
  opacity: 1;
}
`;
