rename("stream_task");
load("./config.js");
var tracker = new SharedMap('tracking');


var fifo_from_rx = Queues.create( 'input');
var fifo_to_file = Queues.create( 'outut');
var IQBlock = new IQData('iq');
var samples = 0 ;

var rx = Soapy.makeDevice( {'query' : 'driver=rtlsdr' });
if( typeof rx != 'object' ) {
	print('no radio ?');
	exit();
}

if( !rx.isValid()) {
	print('no radio ?');
	exit();
}

if( rx.isAvailable() ) {
   // set sample rate
   if( rx.setRxSampleRate( 1e6 )) {
      if(print_debug)
      {
         print('Sample rate changed');
      }  
   }
} else {
   print('device is already used, we do not change Sampling Rate');
}

rx.setGain( rtl_gain, 0 );
rx.setRxCenterFreq( (tracker.load("frequency")/1e6) - 0.2);

var currentdate = new Date();
var current_month = ("0" + (currentdate.getUTCMonth() + 1)).substr(-2);
var current_day = ("0" + currentdate.getUTCDate()).substr(-2);
var current_hours = ("0" + currentdate.getUTCHours()).substr(-2);
var current_minutes = ("0" + currentdate.getUTCMinutes()).substr(-2);
var current_seconds = ("0" + currentdate.getUTCSeconds()).substr(-2);
var time_start = currentdate.getUTCFullYear() + "-" + current_month + "-" + current_day + "T" + current_hours + ":" + current_minutes + ":" + current_seconds;

IO.fwritestr(record_folder + "last_record.ini", "[main]\nkey=" + "record_" + time_start + ".cf32");

// create output file
if(print_debug)
{
   print('create out queue');
}

fifo_to_file.writeToFile(record_folder + 'record_'+ time_start +'.cf32');

if(print_debug)
{
   print('connect queue to receiver');
}

// engage streaming
if( !fifo_from_rx.ReadFromRx( rx ) ) {
	print('Cannot stream from rx');
	exit();
}



var slice = new DDC('one');
slice.setOutBandwidth(48e3); // 48 kHz output
slice.setCenter( 200e3) ;

if(print_debug)
{
   print('starting rx process');
}

var doppler_value = tracker.load("doppler");

var sat_view = tracker.load("status");

while( fifo_from_rx.isFromRx() ) { // if we have something in the input
    if( IQBlock.readFromQueue( fifo_from_rx ) ) {     // load samples from input queue into IQBlock object
        slice.write( IQBlock );               // write the samples in the DDC object
        var ifdata = slice.read();            // read down converted samples
        if(!sat_view)
        {
           if(print_debug)
           {
               print("end of pass");
           }
           var command_end_pass = {
            'command' : "/bin/bash",
            'args' : ['-c', path_cmd_file]
            };
            var msg_python = System.exec( command_end_pass );
            if(print_debug)
            {
               print(msg_python);
            }
           exit();
        }
        while( ifdata.getLength() > 0 && sat_view) {         // if we have something
         sat_view = tracker.load("status");
         if(print_debug)
         {
            print('Writing ...');
         }
         
         fifo_to_file.enqueue( ifdata );         // write the samples in the output queue
         doppler_value = tracker.load("doppler");
         slice.setCenter( 200e3 + parseInt(doppler_value)) ;
         ifdata = slice.read();              // read more
        }        
    }
 }
 


exit();
