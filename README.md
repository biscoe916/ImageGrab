ImageGrab
=========

ImageGrab allows you to quickly and easily save images from websites to the server of your choice using a bookmarklet and short php script.

#####Notes: 
- allow_url_fopen should be enabled in php.ini
- Will not work on sites using the HTTPS protocol (assuming you host this code using HTTP)

#####Todo:
- Move all of the styles into a stylesheet
- Add history so one can click bookmarklet and see past images he/she had saved. Probably use a text file.
- Add optional cURL support as a possible away around requiring allow_url_fopen to be enabled.
