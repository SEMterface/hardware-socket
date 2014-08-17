/*
  Forked frin Serial Event example

  http://www.arduino.cc/en/Tutorial/SerialEvent

  (Line feed, '\n', 0x0A, 10 in decimal <----
  CR (Carriage return, '\r', 0x0D, 13 in decimal)
  (CR+LF, '\r\n', 0x0D0A)

  **************
  Command Format
  **************
  <LF>OP[_arg1,]<CR>
    <LF>:   Line Feed
    OP:     Operation
    arg1...: Argument for command
    <CR>: Carriage return code; a terminator signifying the end of a command
    _: Space code: used to separate between the command and argument or between arguments


 */

String inputCommand = ""; // A string to capture the command before the space
String inputValue = "";  // A string to capture command value after space
String inputString = ""; // The raw Readline string

boolean stringComplete = false;  // whether the string is complete
boolean separator = false; // When a space is received

int led = 13; // An indication LED Pin
int res; // Response status

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // reserve 200 bytes for the inputString:
  inputString.reserve(200); // Who knows
  inputCommand.reserve(20);  // These need to be short
  inputValue.reserve(20); //TODO: Stop appending if to many chars a rerecived.
  digitalWrite(led, LOW);
}

void loop() {
  // print the string when a newline arrives:
  if (stringComplete) {
    digitalWrite(led, LOW); // Turn off the LED.  We are processing now
    // Stuff
    //Serial.print(inputString);
    //Serial.println(inputCommand);
    //Serial.println(inputValue);

    switch (res) {
      case 0:
        // No Error
        break;
      case 3:
        // Format Error
        break;
      case 4:
        // Argument Error
        break;
      case 5:
        // Command Execution Impossible
        // busy for other command execution
        break;
      case 6:
        // Command Execution Impossible
        // mismatch in interpretation of entered command
        break;
      default:
        // statements
        Serial.print("!3 "+ inputString);
    }

    // clear the string:
    inputString = "";
    inputCommand = "";
    inputValue = "";
    stringComplete = false;
    separator = false;
  }
}

/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  while (Serial.available()) {
    // Indicate there is data
    digitalWrite(led, HIGH);
    // get the new byte:
    char inChar = (char)Serial.read();


    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it

    if (inChar == '\n') {
      stringComplete = true;
    } else {
        if (inChar == ' ') {
          separator = true;
        } else {
          if (separator) {
            inputValue += inChar;
          } else {
            inputCommand += inChar;
          }
        }
   }
  }
}
