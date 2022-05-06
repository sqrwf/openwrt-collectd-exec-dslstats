#!/bin/sh


# collectd may or may not provide these variables
HOSTNAME="${COLLECTD_HOSTNAME:-$(cat /proc/sys/kernel/hostname)}" # fallback to kernel hostname
INTERVAL=${COLLECTD_INTERVAL:-30}                                 # fallback to 30 seconds interval
INTERVAL=${INTERVAL%.*}                                           # collectd sends the interval as float, convert to integer


# Source jshn shell library
. /usr/share/libubox/jshn.sh

# Main function to collect values and present them to collectd
collect_and_present() {


	# Retrieve DSL metrics through ubus
	dsl_metrics_json=$(/bin/ubus call dsl metrics)

	# Initialize JSHN and load JSON
	json_init
	json_load "$dsl_metrics_json"


	# Get line state
	json_get_var linestate up

	# Only continue if line is up
	# - collecting any line stats is pointless if the line is down, downtime will be reflected by the gap in statistics
	[ "$linestate" = "1" ] || return


	# Get basic line stats
	json_get_var uptime uptime

	# get downstream and upstream stats
	json_select downstream
		json_get_var downstream_datarate     data_rate
		json_get_var downstream_datarate_max attndr
		json_get_var downstream_snr          snr
		json_get_var downstream_snr_latn     latn
		json_get_var downstream_snr_satn     satn
	json_close_object
	json_select upstream
		json_get_var upstream_datarate       data_rate
		json_get_var upstream_datarate_max   attndr
		json_get_var upstream_snr            snr
		json_get_var upstream_snr_latn       latn
		json_get_var upstream_snr_satn       satn
	json_close_object

	# Get near/far error counters
	# - fallback to zero for counters that do not exist previous to commit
	#   https://git.openwrt.org/?p=openwrt/openwrt.git;a=commit;h=5372205ca9afea8e51c1762eabcaf5a97350bbaf
	json_select errors
		json_select near
			json_get_var errors_near_es       es
			json_get_var errors_near_ses      ses
			json_get_var errors_near_fecs     fecs
			json_get_var errors_near_crc      crc_p
			json_get_var errors_near_crcp     crcp_p
			json_get_var errors_near_cv       cv_p
			json_get_var errors_near_cvp      cvp_p
			json_get_var errors_near_rtx_c    rx_corrected             0
			json_get_var errors_near_rtx_uc   rx_uncorrected_protected 0
			json_get_var errors_near_rtx_tx   tx_retransmitted         0
		json_close_object
		json_select far
			json_get_var errors_far_es        es
			json_get_var errors_far_ses       ses
			json_get_var errors_far_fecs      fecs
			json_get_var errors_far_crc       crc_p
			json_get_var errors_far_crcp      crcp_p
			json_get_var errors_far_cv        cv_p
			json_get_var errors_far_cvp       cvp_p
			json_get_var errors_far_rtx_c     rx_corrected             0
			json_get_var errors_far_rtx_uc    rx_uncorrected_protected 0
			json_get_var errors_far_rtx_tx    tx_retransmitted         0
		json_close_object
	json_close_object

	# Get vectoring error counters
	# - fallback to zero for counters that do not exist previous to commit
	#   https://git.openwrt.org/?p=openwrt/openwrt.git;a=commit;h=70729d345414cdf1463dec042811813ff9a94e7a
	# - mute json warnings if, for the same reason, the "erb" object does not exist
	# - process this section last, nonexistant "erb" object may throw off current position in the json structure
	_json_no_warning=1
	json_select erb
		json_get_var errors_erb_sent         sent      0
		json_get_var errors_erb_discarded    discarded 0
	json_close_object


	# Present values to collectd
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/uptime\" N:$uptime"

	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/bitrate-downstream\" N:$downstream_datarate"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/bitrate-downstream_max\" N:$downstream_datarate_max"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/bitrate-upstream\" N:$upstream_datarate"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/bitrate-upstream_max\" N:$upstream_datarate_max"

	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/snr-downstream\" N:$downstream_snr"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/snr-downstream_latn\" N:$downstream_snr_latn"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/snr-downstream_satn\" N:$downstream_snr_satn"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/snr-upstream\" N:$upstream_snr"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/snr-upstream_latn\" N:$upstream_snr_latn"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/snr-upstream_satn\" N:$upstream_snr_satn"

	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_es\" N:$errors_near_es"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_ses\" N:$errors_near_ses"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_fecs\" N:$errors_near_fecs"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_crc\" N:$errors_near_crc"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_crcp\" N:$errors_near_crcp"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_cv\" N:$errors_near_cv"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_cvp\" N:$errors_near_cvp"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_rtx_c\" N:$errors_near_rtx_c"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_rtx_uc\" N:$errors_near_rtx_uc"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-near_rtx_tx\" N:$errors_near_rtx_tx"

	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_es\" N:$errors_far_es"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_ses\" N:$errors_far_ses"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_fecs\" N:$errors_far_fecs"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_crc\" N:$errors_far_crc"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_crcp\" N:$errors_far_crcp"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_cv\" N:$errors_far_cv"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_cvp\" N:$errors_far_cvp"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_rtx_c\" N:$errors_far_rtx_c"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_rtx_uc\" N:$errors_far_rtx_uc"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-far_rtx_tx\" N:$errors_far_rtx_tx"

	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-erb_sent\" N:$errors_erb_sent"
	echo "PUTVAL \"$HOSTNAME/exec-dslstats-lantiq/errors-erb_discarded\" N:$errors_erb_discarded"

}


# Main infinite loop
while true; do

	collect_and_present

	# The collect_and_present process takes approx. 0.4 seconds, and since busybox sleep does not do fractions of
	# a second, we sleep for the full interval. This will throw off the interval slightly, of course, but collectd
	# is designed to take irregular updates and accounts for that by calculating per-second values anyway.
	# In the end the minor drift is very much cosmetic.
	sleep "$INTERVAL"

done


# EOF