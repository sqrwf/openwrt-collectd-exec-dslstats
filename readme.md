This set of scripts collects and displays xDSL modem statistics in OpenWrt for Lantiq targets with an internal xDSL modem.


<img src="screenshot.png?raw=true" width="400">


## Compatibility

OpenWrt 21.02, 22.03, snapshots (as of May 2022)


## Requirements

To collect data, the packages `collectd` and `collectd-mod-exec` are required. To display the statistics in LuCI, `luci-app-statistics` is neccessary, and for ease of configuration it is recommended.


## Installation

Put the following files into the file system:

* `/etc/collecd/collectd-dslstats-lantiq.sh` and make it executable (`chmod +x`)  
  the shell script responsible for collecting the data
* `/usr/share/rpcd/acl.d/collectd-exec-lantiqdsl.json`
  extends the ACL (access control list) to allow the shell script to access dsl metrics via ubus  
* `/www/luci-static/resources/statistics/rrdtool/definitions/exec.js`  
  definitions for statistics display in LuCI
* optional: `/www/luci-static/resources/statistics/rrdtool.js`  
  improved/modified statistics display script, allowing for more control over the graphs' visual parameters

Reboot the system to have the ACL extension take effect.
  
Enable the script in collectd:

* In LuCI, under _Statistics > Setup_, in the _General_ tab, enable the _exec_ plugin, and in its configuration add the command for reading values:  
  `/etc/collectd/collectd-dslstats-lantiq.sh`  
  keep _User_ and _Group_ at "nobody"


## Notes

* I am not aware of any other, more elegant way to reload the ACL than to reboot the system.

* The script will collect additional data for Vectoring lines if a [build containing the fixes for Vectoring samples](https://git.openwrt.org/?p=openwrt/openwrt.git;a=commit;h=f872b966092ece5c0e2192e0d979a9eb69283f17) is used. In 21.02 and 22.03-RCs the statistics will show an empty graph for these values.

* The optional modified `rrdtool.js` should (and in all my tests does) not interfere with existing statistics definitions, but I can't test all cases of all definitions. If it causes errors in other more uncommon scenarios feedback will be appreciated.

* `exec.js` contains code to display the same data, collected from a Broadcom-based ZyXEL VMG1312-B30A modem using a different shell script. I can currently not test the script to collect the data, so it is not published here until I can.
