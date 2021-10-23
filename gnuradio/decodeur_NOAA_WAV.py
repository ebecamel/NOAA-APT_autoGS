#!/usr/bin/env python3
# -*- coding: utf-8 -*-

#
# SPDX-License-Identifier: GPL-3.0
#
# GNU Radio Python Flow Graph
# Title: Decodeur NOAA sdr4space GNU Radio WAV
# Author: Enzo BECAMEL F4IAI
# Description: Decodeur pour satellite NOAA utilisant les logiciels sdr4space.light et GNURadio Companion
# GNU Radio version: 3.8.3.1

from gnuradio import analog
from gnuradio import audio
from gnuradio import blocks
import pmt
from gnuradio import gr
from gnuradio.filter import firdes
import sys
import signal
from argparse import ArgumentParser
from gnuradio.eng_arg import eng_float, intx
from gnuradio import eng_notation
try:
    import configparser
except ImportError:
    import ConfigParser as configparser


class decodeur_NOAA_WAV(gr.top_block):

    def __init__(self):
        gr.top_block.__init__(self, "Decodeur NOAA sdr4space GNU Radio WAV")

        ##################################################
        # Variables
        ##################################################
        self.samp_rate = samp_rate = 48000
        self._name_record_config = configparser.ConfigParser()
        self._name_record_config.read('/home/enzo/Documents/GNURadio/decodeur_NOAA/sdr4space_multi/last_record.ini')
        try: name_record = self._name_record_config.get('main', 'key')
        except: name_record = "record"
        self.name_record = name_record

        ##################################################
        # Blocks
        ##################################################
        self.blocks_wavfile_sink_0 = blocks.wavfile_sink('/home/enzo/Documents/GNURadio/decodeur_NOAA/record.wav', 1, samp_rate, 8)
        self.blocks_file_source_0 = blocks.file_source(gr.sizeof_gr_complex*1, "/home/enzo/Documents/GNURadio/decodeur_NOAA/sdr4space_multi/" + name_record, False, 0, 0)
        self.blocks_file_source_0.set_begin_tag(pmt.PMT_NIL)
        self.audio_sink_0 = audio.sink(samp_rate, '', True)
        self.analog_wfm_rcv_0 = analog.wfm_rcv(
        	quad_rate=48000,
        	audio_decimation=1,
        )


        ##################################################
        # Connections
        ##################################################
        self.connect((self.analog_wfm_rcv_0, 0), (self.audio_sink_0, 0))
        self.connect((self.analog_wfm_rcv_0, 0), (self.blocks_wavfile_sink_0, 0))
        self.connect((self.blocks_file_source_0, 0), (self.analog_wfm_rcv_0, 0))


    def get_samp_rate(self):
        return self.samp_rate

    def set_samp_rate(self, samp_rate):
        self.samp_rate = samp_rate

    def get_name_record(self):
        return self.name_record

    def set_name_record(self, name_record):
        self.name_record = name_record
        self.blocks_file_source_0.open("/home/enzo/Documents/GNURadio/decodeur_NOAA/sdr4space_multi/" + self.name_record, False)





def main(top_block_cls=decodeur_NOAA_WAV, options=None):
    tb = top_block_cls()

    def sig_handler(sig=None, frame=None):
        tb.stop()
        tb.wait()

        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)

    tb.start()

    tb.wait()


if __name__ == '__main__':
    main()
