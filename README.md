ImageGrab
=========

With just 2-clicks, ImageGrab allows you to quickly and easily save images from websites to the server of your choice using a bookmarklet and short php script.

#####Example bookmark:
```
javascript:var s= document.createElement('script');s.type='text/javascript';document.body.appendChild(s);s.src='http://www.YOURSITE.com/bookmarklet.js';void(0);
```
#####Notes: 
- allow_url_fopen should be enabled in php.ini
- Will not work on sites using the HTTPS protocol (assuming you host this code using HTTP)

#####Todo:
- Move all of the styles into a stylesheet
- Add history so one can see past images he/she had saved. Probably use a text file.
- Add optional cURL support as a possible away around requiring allow_url_fopen to be enabled.
- Add additional mode where one can click on the images on the actual page.
