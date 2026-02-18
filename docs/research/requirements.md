requirements for the configuration:

multi mcdu support: register new mcdu
- search existing mcdu on the web or enter ip adress and port
- name the mcdu

select MCDU that you want to create a configuration for

create pages/ page administration
- name, description
- select template
- menue button
- data points (either just displaying info/ value or input or switching)
- positioning of menue points on screen

templates:
- data display templates (eg. Solar panel display shows shows values: current power, home consumption, sent to grid, sent to battery): if you select the template you can allocate the right data points from your data structure.
- control templates (eg. heat control)
- room templates (combination of display stati and control)

save/ load configuration

Align with the devices adapter and the iobroker data structure. Every data point has meta data such as "function", "room", "type" and "states". don't reinvent the wheel but use iobrokers data structure, hierarchies etc.

datapoints to sense and control the display
- brighntess display
- brightness buttons
- sensor data from light sensor


future development: notification functions: possibility to send functions to the display