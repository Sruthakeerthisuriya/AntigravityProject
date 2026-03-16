package Variables;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import static org.junit.jupiter.api.Assertions.*;

public class AddTwoVariableTest {

    private final ByteArrayOutputStream outputStreamCaptor = new ByteArrayOutputStream();
    private final PrintStream originalOut = System.out;

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outputStreamCaptor));
    }

    @AfterEach
    public void tearDown() {
        System.setOut(originalOut);
    }

    @Test
    @DisplayName("Verify logic coverage: Ensure both sums are calculated and printed correctly")
    public void testMainMethodLogic() {
        AddTwoVariable.main();
        
        String output = outputStreamCaptor.toString().trim();
        String[] lines = output.split("\\R");

        assertEquals(2, lines.length, "The application should output exactly two lines.");
        assertEquals("120", lines[0].trim(), "The first addition (100 + 20) should be 120.");
        assertEquals("220", lines[1].trim(), "The second addition (100 + 120) should be 220.");
    }

    @Test
    @DisplayName("Edge Case: Verify main method handles null arguments without exception")
    public void testMainWithNullArgs() {
        assertDoesNotThrow(() -> AddTwoVariable.main((String[]) null), 
            "The main method should handle null arguments gracefully.");
    }

    @Test
    @DisplayName("Edge Case: Verify main method handles empty arguments")
    public void testMainWithEmptyArgs() {
        assertDoesNotThrow(() -> AddTwoVariable.main(new String[]{}), 
            "The main method should handle an empty string array.");
    }

    @Test
    @DisplayName("Edge Case: Verify main method with multiple arbitrary arguments")
    public void testMainWithMultipleArgs() {
        assertDoesNotThrow(() -> AddTwoVariable.main("test", "data", "123"), 
            "The main method should handle multiple input arguments.");
        assertFalse(outputStreamCaptor.toString().isEmpty(), "Output should not be empty upon execution.");
    }

    @Test
    @DisplayName("Verify addition logic consistency")
    public void testAdditionArithmetic() {
        int a = 100;
        int b = 20;
        int expectedFirst = 120;
        assertEquals(expectedFirst, a + b, "Manual arithmetic check for first block failed.");

        int s = 100;
        int t = 120;
        int expectedSecond = 220;
        assertEquals(expectedSecond, s + t, "Manual arithmetic check for second block failed.");
    }

    @Test
    @DisplayName("Smoke Test: Ensure class can be instantiated")
    public void testConstructor() {
        AddTwoVariable instance = new AddTwoVariable();
        assertNotNull(instance, "Class instance should be creatable.");
    }
}