# openwrt-collectd-exec-dslstats

Set of scripts for OpenWrt to collect and display xDSL modem statistics.


<img src="screenshot.png?raw=true" width="400">


## Compatibility

* OpenWrt 21.02, 22.03, snapshots (as of May 2022)
* Lantiq targets with internal xDSL modem


## Requirements

* `collectd` and `collectd-mod-exec` to collect the data
* `luci-app-statistics` to display the statistics in LuCI  
   (strictly speaking not necessary if you just want collectd to collect the data and possibly pass it on, but highly recommended for ease of configuration)


## Installation

Put the following files into the file system:

* `/etc/collectd/collectd-dslstats-lantiq.sh` and make it executable (`chmod +x`)  
  shell script responsible for collecting the data
* `/usr/share/acl.d/collectd-exec-lantiqdsl.json`  
  extends the ACL (access control list) allowing the "nobody" user access to ubus dsl metrics
* `/www/luci-static/resources/statistics/rrdtool/definitions/exec.js`  
  definition for statistics display in LuCI
* optional: `/www/luci-static/resources/statistics/rrdtool.js`  
  improved/modified statistics display script, allowing for more control over the graphs' visual parameters

Reboot the system to have the ACL extension take effect.
  
Enable the script in collectd:

* In LuCI, under _Statistics > Setup_, in the _General_ tab, enable the _exec_ plugin, and in its configuration add the command for reading values:  
  `/etc/collectd/collectd-dslstats-lantiq.sh`  
  keep _User_ at "nobody" and _Group_ at "nogroup"
* Alternatively enable in `/etc/collectd.conf`:
  ```
  LoadPlugin exec
  <Plugin exec>
            Exec "nobody:nogroup" "/etc/collectd/collectd-dslstats-lantiq.sh"
  </Plugin>
  ```

## Notes

* I am not aware of any other, more elegant way to reload the ACL than to reboot the system. Please tell me if you do.

* The script will collect additional data (DTU counters) for Vectoring lines if a [build containing the fixes for Vectoring samples](https://git.openwrt.org/?p=openwrt/openwrt.git;a=commit;h=f872b966092ece5c0e2192e0d979a9eb69283f17) is used. In 21.02 and 22.03-RCs the statistics will show a permanent-zero graph for these values.

* The script collects "error" values for `cv` and `cv_p` ("code violations") and, on Vectoring lines with the error samples patch, `erb` values (sent/discarded error reports). They are submitted to and kept by collectd but not displayed as a graph.

* The optional modified `rrdtool.js` mainly allows graph areas without lines and setting the area colors. The default script insists on lines and reduces the saturation of area colors, which obscures minor variations in the graph and makes it hard to distinguish areas from each other. Using the modified `rrdtool.js`should (and in all my tests does) not influence existing statistics definitions, but I can't test all cases of all definitions. If it causes errors in other more uncommon scenarios feedback will be appreciated.

* `exec.js` contains code to display the same data collected from a Broadcom-based ZyXEL VMG1312-B30A modem using a different shell script. I am currently unable to test that collection script, so it is not part of this repository yet.
