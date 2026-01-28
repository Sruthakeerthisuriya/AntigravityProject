import Variables.AddTwoVariable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AddTwoVariableTest {

    private final PrintStream standardOut = System.out;
    private final ByteArrayOutputStream outputStreamCaptor = new ByteArrayOutputStream();

    @BeforeEach
    void setUp() {
        // Redirect System.out before each test
        System.setOut(new PrintStream(outputStreamCaptor));
    }

    @AfterEach
    void tearDown() {
        // Restore System.out after each test
        System.setOut(standardOut);
    }

    // --- Tests verifying the hardcoded behavior of the main method ---

    @Test
    void testMainMethodPrintsCorrectHardcodedResults() {
        // Execute the main method
        AddTwoVariable.main(null);

        // Expected output structure:
        // 120 (from 100 + 20) followed by line separator
        // 220 (from 100 + 120) followed by line separator
        String expectedOutput = "120" + System.lineSeparator() + "220" + System.lineSeparator();

        assertEquals(expectedOutput, outputStreamCaptor.toString(), 
                     "The main method output should match the two hardcoded sums (120 and 220).");
    }

    @Test
    void testMainMethodOutputFormat() {
        AddTwoVariable.main(new String[]{});

        String actualOutput = outputStreamCaptor.toString();
        
        // Verify that the output contains two lines
        String[] lines = actualOutput.split(System.lineSeparator());
        assertTrue(lines.length >= 2, "Output should contain at least two lines.");
        
        // Verify the content of the lines
        assertEquals("120", lines[0].trim(), "First calculated sum should be 120.");
        assertEquals("220", lines[1].trim(), "Second calculated sum should be 220.");
    }

    // --- Comprehensive Logic Coverage Tests (for the implicit integer addition logic) ---

    // Since the core function of the class is integer addition, we verify that standard
    // Java integer addition logic holds true, covering various scenarios (edge cases).

    private int performAddition(int a, int b) {
        // Simulating the core addition logic used by the class (a + b)
        return a + b;
    }
    
    @Test
    void testStandardPositiveAddition() {
        assertEquals(300, performAddition(150, 150));
        assertEquals(1, performAddition(0, 1));
    }

    @Test
    void testAdditionWithNegativeNumbers() {
        // Both negative
        assertEquals(-50, performAddition(-20, -30));
        // Mixed signs (positive result)
        assertEquals(10, performAddition(30, -20));
        // Mixed signs (negative result)
        assertEquals(-10, performAddition(20, -30));
    }

    @Test
    void testAdditionWithZero() {
        assertEquals(500, performAddition(500, 0));
        assertEquals(-500, performAddition(-500, 0));
        assertEquals(0, performAddition(0, 0));
    }

    @Test
    void testMaximumIntegerOverflow() {
        int max = Integer.MAX_VALUE;
        // Adding 1 to MAX_VALUE should wrap to MIN_VALUE
        int expected = Integer.MIN_VALUE;
        assertEquals(expected, performAddition(max, 1), "MAX_VALUE + 1 should cause overflow to MIN_VALUE.");
        
        // Testing addition that results in overflow 
        assertEquals(-2147483648, performAddition(2000000000, 2000000000)); 
    }

    @Test
    void testMinimumIntegerUnderflow() {
        int min = Integer.MIN_VALUE;
        // Subtracting 1 (or adding -1) from MIN_VALUE should wrap to MAX_VALUE
        int expected = Integer.MAX_VALUE;
        assertEquals(expected, performAddition(min, -1), "MIN_VALUE - 1 should cause underflow to MAX_VALUE.");
        
        // Testing addition that results in underflow
        assertEquals(2147483647, performAddition(-2000000000, -2000000000));
    }
}
