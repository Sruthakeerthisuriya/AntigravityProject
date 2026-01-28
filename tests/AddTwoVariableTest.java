import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import Variables.AddTwoVariable;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AddTwoVariableTest {

    private final PrintStream standardOut = System.out;
    private final ByteArrayOutputStream outputStreamCaptor = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        // Redirect standard output to capture stream
        System.setOut(new PrintStream(outputStreamCaptor));
    }

    @AfterEach
    public void tearDown() {
        // Restore standard output
        System.setOut(standardOut);
    }

    /**
     * Test case to verify the complete execution and output of the main method.
     * Since all variables (a=100, b=20, s=100, t=120) are hardcoded inside main,
     * this test checks for the specific, expected printed output to ensure
     * full logic coverage of the existing code structure.
     */
    @Test
    void testMainMethodPrintsCorrectSums() {
        
        // Execute the main method which contains all the application logic
        AddTwoVariable.main();

        /* 
         * Expected Output Calculation:
         * 1. System.out.println(a+b) -> 100 + 20 = 120
         * 2. System.out.println(r)   -> 100 + 120 = 220
         */
        
        String expectedOutput = "120" + System.lineSeparator() + 
                                "220" + System.lineSeparator();

        // Assert that the captured output exactly matches the expected sequence
        assertEquals(expectedOutput, outputStreamCaptor.toString(), 
                     "The main method should output the two fixed sums separated by newlines.");
    }
}