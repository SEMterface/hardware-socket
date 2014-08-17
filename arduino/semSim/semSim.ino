/*
  Forked frin Serial Event example

  http://www.arduino.cc/en/Tutorial/SerialEvent

 */

String inputCommand = "";
String inputValue = "";  // a string to hold incoming data
String inputString = "";

int myInts[30];
int myIntsIndex = 0;

boolean stringComplete = false;  // whether the string is complete
boolean separator = false;

int led = 13; // An indication LED Pin

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // reserve 200 bytes for the inputString:
  inputString.reserve(200);
  inputCommand.reserve(20);
  inputValue.reserve(20);
}

void loop() {
  // print the string when a newline arrives:
  if (stringComplete) {
    digitalWrite(led, LOW);

    Serial.print(inputString);
    Serial.println(inputCommand);
    Serial.println(inputValue);

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
