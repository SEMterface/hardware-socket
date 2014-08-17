/*
  Forked frin Serial Event example

  http://www.arduino.cc/en/Tutorial/SerialEvent

  **************
  Command Format
  **************
  <LF>OP[_arg1,]<CR>
    <LF>:   Line Feed
    OP:     Operation
    arg1...: Argument for command
    <CR>: Carriage return code; a terminator signifying the end of a command
    _: Space code: used to separate between the command and argument or between arguments

  *******************
  Receiving a command
  *******************

  !A[_OP value]<CR>

  *************
  Special Chars
  *************
  TODO: Verify and fix the line feeds with the scope.

  <LF> ('\n') (Line feed, '\n', 0x0A, 10 in decimal <----
  <CR> ('\r') (Carriage return, '\r', 0x0D, 13 in decimal)
  (CR+LF, '\r\n', 0x0D0A)

 */

String inputCommand = ""; // A string to capture the command before the space
String inputValue = "";  // A string to capture command value after space
String inputString = ""; // The raw Readline string
String testString = ""; // Used for string testing
String simVar = "10"; // TODO: Set up a larger bank of sim variables

char lf = '\n';
char cr = '\r';

void printcr(String msg) {
  Serial.print(msg + cr);
  return;
}

boolean stringComplete = false;  // whether the string is complete
boolean separator = false; // When a space is received

int led = 13; // An indication LED Pin
int res = 1; // Response status.  res status 1 is unhandled
int val = false; // a value has been parsed
int com = false; // a command has been parsed

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // reserve 200 bytes for the inputString:
  inputString.reserve(200); // Who knows
  inputCommand.reserve(20);  // These need to be short
  inputValue.reserve(20); //TODO: Stop appending if to many chars a rerecived.
  simVar.reserve(20);
  digitalWrite(led, LOW);
}

void loop() {
  // print the string when a newline arrives:
  if (stringComplete) {
    digitalWrite(led, LOW); // Turn off the LED.  We are processing now

    if (val) {
      simVar = inputValue; // Update the global sim variable
    }

    // Simple command validating.
    if (com || (com && val))  { // Check if a command and value was received.
      res = 0; // Set it to pass and invalidate with future tests.
      if (inputCommand.length() > 8) { // Commands wont ever be greater than 8.
        res = 3;
      } else {
        testString += inputCommand; // Test if its upper case or not
        testString.toUpperCase();
        if (testString != inputCommand){
          res = 3;
          // TODO test values
        }
      }
    }


    switch (res) {
      case 0:   // No Error
        if (com && val) {
          printcr("!0");
        } else {
          printcr("!0 " + inputCommand + " " +  simVar);
        }
        break;
      case 3:   // Format Error
        printcr("!3");
        break;
      case 4:   // Argument Error

        break;
      case 5:   // Command Execution Impossible

        // busy for other command execution
        break;
      case 6:   // Command Execution Impossible

        // mismatch in interpretation of entered command
        break;
      default:  // Unhandled

        if (inputCommand.length() > 0) {
          Serial.print("!3 "+ inputString);
        } else {
          Serial.print("!3");
        }
    }

    // clear the string:
    inputString = "";
    inputCommand = "";
    inputValue = "";
    testString = "";
    stringComplete = false;
    separator = false;
    val = false;
    com = false;
    res = 1;
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

    if (inChar == cr) {
      stringComplete = true;
    } else if (inChar == lf) {
      // Pass..
    } else {
        if ((inChar == ' ') && (separator == false)) {
          separator = true;
        } else {
          if (separator) {
            inputValue += inChar;
            val = true;
          } else {
            inputCommand += inChar;
            com = true;
          }
        }
   }
  }
}
