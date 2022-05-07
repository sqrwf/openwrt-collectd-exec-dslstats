'use strict';
'require baseclass';
return baseclass.extend({

	title: _('DSL'),

	rrdargs: function(graph, host, plugin, plugin_instance, dtype) {

		/* Graph settings */
		var _settings = {
			/* Graph colors */
			colors : {
				near_regular : { line : "006600", area : "a3cca3" },
				near_minor   : { line : "80b380", area : "c8e0c8" },
				near_error   : { line : "660000", area : "660000" },
				far_regular  : { line : "000066", area : "a3a3cc" },
				far_minor    : { line : "8080b3", area : "c8c8e0" },
				far_error    : { line : "660000", area : "660000" }
			},
			scaling : {
				datarates   : { factor : ( plugin_instance == 'dslstats-lantiq' ? "0.000001" : "0.001" ) },
					/* different transformation of datarates to get Mbit/s (Lantiq counts bit/s, Zyxel counts kbit/s) */
				errors_fecs : { factor : 60,    label : "min", minmax : 6 },
				errors_fec  : { factor : 60,    label : "min", minmax : 100 },
				errors_dtu  : { factor : 60,    label : "min", minmax : 60 },
				errors_erb  : { factor : 60,    label : "min", minmax : 2000 },
				errors_crc  : { factor : 86400, label : "day", minmax : 100 },
				errors_es   : { factor : 86400, label : "day", minmax : 100 }
			}
		}

		/* Uptime graph */
		var uptime = {
			title: "%H: DSL line uptime",
			vlabel: "days",
			y_max: 1, /* give an initial sensible scale if uptime is less than one day */
			number_format: "%5.1lf days",
			rrdopts: ["-h 80", "-N"],
			data: {
				types: ["uptime"],
				options: {
					uptime: {
						title:         "Uptime",
						transform_rpn: "86400,/",
						noavg:         true,
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true
					}
				}
			}
		};

		/* Datarates graph */
		var datarates = {
			title: "%H: DSL datarates",
			vlabel: "Mbit/s",
			number_format: "%7.3lf Mbit/s",
			alt_autoscale: true,
			rrdopts: ["-N"],
			data: {
				instances: {
					bitrate: ["downstream", "upstream", "downstream_max", "upstream_max"]
				},
				options: {
					bitrate_downstream: {
						title:         "Downstream",
						transform_rpn: _settings.scaling.datarates.factor + ",*",
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true,
						weight:        2
					},
					bitrate_upstream: {
						title:         "Upstream",
						transform_rpn: _settings.scaling.datarates.factor + ",*",
						color:         _settings.colors.far_regular.line,
						area_color:    _settings.colors.far_regular.area,
						noline:        true,
						flip:          true,
						weight:        2
					},
					bitrate_downstream_max: {
						title:         "Downstream (max.)",
						transform_rpn: _settings.scaling.datarates.factor + ",*",
						color:         _settings.colors.near_minor.line,
						area_color:    _settings.colors.near_minor.area,
						noline:        true,
						overlay:       true,
						weight:        1
					},
					bitrate_upstream_max: {
						title:         "Upstream (max.)",
						transform_rpn: _settings.scaling.datarates.factor + ",*",
						color:         _settings.colors.far_minor.line,
						area_color:    _settings.colors.far_minor.area,
						noline:        true,
						overlay:       true,
						flip:          true,
						weight:        1
					}
				}
			}
		};

		/* SNR graph */
		var snr = {
			title: "%H: DSL line SNR/attenuation",
			vlabel: "dB",
			number_format: "%4.1lf dB",
			alt_autoscale: true,
			rrdopts: ["-N"],
			data: {
				instances: {
					snr: ["downstream", "upstream", "downstream_latn", "upstream_latn"]
				},
				options: {
					snr_downstream: {
						title:         "Downstream",
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true,
						overlay:       true
					},
					snr_upstream: {
						title:         "Upstream",
						color:         _settings.colors.far_regular.line,
						area_color:    _settings.colors.far_regular.area,
						noline:        true,
						flip:          true
					},
					snr_downstream_latn: {
						title:         "Downstream line attn.",
						color:         _settings.colors.near_regular.line,
						line_width:    1,
						noarea:        true,
						overlay:       true
					},
					snr_upstream_latn: {
						title:         "Upstream line attn.",
						color:         _settings.colors.far_regular.line,
						line_width:    1,
						noarea:        true,
						overlay:       true,
						flip:          true
					}
				}
			}
		};

		/* FECs graph (Lantiq counts FEC seconds) */
		var errors_fecs = {
			title: "%H: DSL FECs",
			vlabel: "seconds/" + _settings.scaling.errors_fecs.label,
			number_format: "%6.1lf",
			y_min: - _settings.scaling.errors_fecs.minmax,
			y_max: _settings.scaling.errors_fecs.minmax,
			alt_autoscale: true,
			rrdopts: ["-h 80","-N"],
			data: {
				instances: {
					errors: ["near_fecs", "far_fecs"]
				},
				options: {
					errors_near_fecs: {
						title:         "Near FECs",
						transform_rpn: _settings.scaling.errors_fecs.factor + ",*",
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true
					},
					errors_far_fecs: {
						title:         "Far FECs",
						transform_rpn: _settings.scaling.errors_fecs.factor + ",*",
						color:         _settings.colors.far_regular.line,
						area_color:    _settings.colors.far_regular.area,
						noline:        true,
						flip:          true
					}
				}
			}
		};

		/* FEC graph (Zyxel counts single FEC) */
		var errors_fec = {
			title: "%H: DSL FEC",
			vlabel: "seconds/" + _settings.scaling.errors_fec.label,
			number_format: "%6.1lf",
			y_min: - _settings.scaling.errors_fec.minmax,
			y_max: _settings.scaling.errors_fec.minmax,
			alt_autoscale: true,
			rrdopts: ["-h 80","-N"],
			data: {
				instances: {
					errors: ["near_fec", "far_fec"]
				},
				options: {
					errors_near_fec: {
						title:         "Near FEC",
						transform_rpn: _settings.scaling.errors_fec.factor + ",*",
						color:         _settings.colors.near_regular.line
					},
					errors_far_fec: {
						title:         "Far FEC",
						transform_rpn: _settings.scaling.errors_fec.factor + ",*",
						color:         _settings.colors.far_regular.line,
						flip:          true
					}
				}
			}
		};

		/* DTU counters graph */
		var errors_dtu = {
			title: "%H: DSL DTU counters",
			vlabel: "DTU/" + _settings.scaling.errors_dtu.label,
			number_format: "%6.1lf",
			y_min: - _settings.scaling.errors_dtu.minmax,
			y_max: _settings.scaling.errors_dtu.minmax,
			rrdopts: ["-h 80","-N"],
			alt_autoscale: true,
			data: {
				instances: {
					errors: ["far_rtx_tx", "near_rtx_c", "near_rtx_uc", "near_rtx_tx", "far_rtx_c", "far_rtx_uc"]
				},
				options: {
					errors_far_rtx_tx: {
						title:         "Far->near retransmitted  (rtx-tx)",
						transform_rpn: _settings.scaling.errors_dtu.factor + ",*",
						color:         _settings.colors.near_minor.line,
						area_color:    _settings.colors.near_minor.area,
						noline:        true,
						overlay:       true
					},
					errors_near_rtx_c: {
						title:         "Near corrected (rtx-c)",
						transform_rpn: _settings.scaling.errors_dtu.factor + ",*",
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true
					},
					errors_near_rtx_uc: {
						title:         "Near uncorrected (rtx-uc)",
						transform_rpn: _settings.scaling.errors_dtu.factor + ",*",
						color:         _settings.colors.near_error.line,
						area_color:    _settings.colors.near_error.area,
						noline:        true
					},
					errors_near_rtx_tx: {
						title:         "Near->far retransmitted (rtx-tx)",
						transform_rpn: _settings.scaling.errors_dtu.factor + ",*",
						color:         _settings.colors.far_minor.line,
						area_color:    _settings.colors.far_minor.area,
						noline:        true,
						overlay:       true,
						flip:          true
					},
					errors_far_rtx_c: {
						title:         "Far corrected (rtx-c)",
						transform_rpn: _settings.scaling.errors_dtu.factor + ",*",
						color:         _settings.colors.far_regular.line,
						area_color:    _settings.colors.far_regular.area,
						noline:        true,
						flip:          true
					},
					errors_far_rtx_uc: {
						title:         "Far uncorrected (rtx-uc)",
						transform_rpn: _settings.scaling.errors_dtu.factor + ",*",
						color:         _settings.colors.far_error.line,
						area_color:    _settings.colors.far_error.area,
						noline:        true,
						flip:          true
					}
				}
			}
		};

		/* ERB vectoring error reports graph */
		var errors_erb = {
			title: "%H: DSL vectoring error reports",
			vlabel: "reports/" + _settings.scaling.errors_erb.label,
			number_format: "%7.1lf",
			y_min: 0,
			y_max: _settings.scaling.errors_erb.minmax,
			rrdopts: ["-h 80"],
			alt_autoscale: true,
			data: {
				instances: {
					errors: ["erb_sent", "erb_discarded"]
				},
				options: {
					errors_erb_sent: {
						title:         "Sent error reports",
						transform_rpn: _settings.scaling.errors_erb.factor + ",*",
						color:         _settings.colors.near_regular.line,
						noline:        true
					},
					errors_erb_discarded: {
						title:         "Discarded error reports",
						transform_rpn: _settings.scaling.errors_erb.factor + ",*",
						color:         _settings.colors.near_error.line,
						noline:        true
					}
				}
			}
		};

		/* Errored seconds graph */
		var errors_es = {
			title: "%H: DSL errored seconds",
			vlabel: "seconds/" + _settings.scaling.errors_es.label,
			y_min: - _settings.scaling.errors_es.minmax,
			y_max: _settings.scaling.errors_es.minmax,
			rrdopts: ["-h 80","-N"],
			alt_autoscale: true,
			data: {
				instances: {
					errors: ["near_es", "near_ses", "far_es", "far_ses" ]
				},
				options: {
					errors_near_es: {
						title:         "Near errored seconds (ES)",
						transform_rpn: _settings.scaling.errors_es.factor + ",*",
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true
					},
					errors_near_ses: {
						title:         "Near severely errored seconds (SES)",
						transform_rpn: _settings.scaling.errors_es.factor + ",*",
						color:         _settings.colors.near_error.line,
						area_color:    _settings.colors.near_error.area,
						noline:        true
					},
					errors_far_es: {
						title:         "Far errored seconds (ES)",
						transform_rpn: _settings.scaling.errors_es.factor + ",*",
						color:         _settings.colors.far_regular.line,
						area_color:    _settings.colors.far_regular.area,
						noline:        true,
						flip:          true
					},
					errors_far_ses: {
						title:         "Far severely errored seconds (SES)",
						transform_rpn: _settings.scaling.errors_es.factor + ",*",
						color:         _settings.colors.far_error.line,
						area_color:    _settings.colors.far_error.area,
						flip:          true,
						noline:        true
					}
				}
			}
		};

		/* Error counters graph */
		var errors_crc = {
			title: "%H: DSL error counters",
			vlabel: "errors/" + _settings.scaling.errors_crc.label,
			y_min: - _settings.scaling.errors_crc.minmax,
			y_max: _settings.scaling.errors_crc.minmax,
			rrdopts: ["-h 80","-N"],
			alt_autoscale: true,
			data: {
				instances: {
					/* Zyxel does not count CRCp */
					errors: ( plugin_instance == 'dslstats-lantiq' ? ["near_crc", "near_crcp", "far_crc", "far_crcp"] : ["near_crc", "far_crc"] )
				},
				options: {
					errors_near_crc: {
						title:         "Near CRC",
						transform_rpn: _settings.scaling.errors_crc.factor + ",*",
						color:         _settings.colors.near_regular.line,
						area_color:    _settings.colors.near_regular.area,
						noline:        true
					},
					errors_near_crcp: {
						title:         "Near CRC (preemptive)",
						transform_rpn: _settings.scaling.errors_crc.factor + ",*",
						color:         _settings.colors.near_minor.line,
						area_color:    _settings.colors.near_minor.area,
						noline:        true
					},
					errors_far_crc: {
						title:         "Far CRC",
						transform_rpn: _settings.scaling.errors_crc.factor + ",*",
						color:         _settings.colors.far_regular.line,
						area_color:    _settings.colors.far_regular.area,
						noline:        true,
						flip:          true
					},
					errors_far_crcp: {
						title:         "Far CRC (preemptive)",
						transform_rpn: _settings.scaling.errors_crc.factor + ",*",
						color:         _settings.colors.far_minor.line,
						area_color:    _settings.colors.far_minor.area,
						noline:        true,
						flip:          true
					}
				}
			}
		};

		if ( plugin_instance == 'dslstats-lantiq' ) {

			/* Graphs for Lantiq */
			return [uptime,datarates,snr,errors_fecs,errors_dtu,errors_es,errors_crc];

		} else {

			/* Graphs for Zyxel */
			return [uptime,datarates,snr,errors_fec,errors_es,errors_crc];

		}

	}

});