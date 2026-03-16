import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HelloWorldTest {

    private final PrintStream standardOut = System.out;
    private final ByteArrayOutputStream outputStreamCaptor = new ByteArrayOutputStream();

    @BeforeEach
    void setUp() {
        System.setOut(new PrintStream(outputStreamCaptor));
    }

    @AfterEach
    void tearDown() {
        System.setOut(standardOut);
    }

    @Test
    @DisplayName("Verify main method prints the correct greeting to stdout with empty array")
    void testMainOutputEmptyArgs() {
        String[] args = {};
        HelloWorld.main(args);
        assertEquals("Hello, World!" + System.lineSeparator(), outputStreamCaptor.toString());
    }

    @Test
    @DisplayName("Verify main method handles null input without throwing exception")
    void testMainWithNullArgs() {
        HelloWorld.main(null);
        assertEquals("Hello, World!" + System.lineSeparator(), outputStreamCaptor.toString());
    }

    @Test
    @DisplayName("Verify main method output is unaffected by provided command line arguments")
    void testMainWithPopulatedArgs() {
        String[] args = {"arg1", "arg2", "test"};
        HelloWorld.main(args);
        assertEquals("Hello, World!" + System.lineSeparator(), outputStreamCaptor.toString());
    }

    @Test
    @DisplayName("Verify main method output consistency across multiple calls")
    void testMainMultipleCalls() {
        HelloWorld.main(new String[0]);
        HelloWorld.main(new String[0]);
        String expected = "Hello, World!" + System.lineSeparator() + "Hello, World!" + System.lineSeparator();
        assertEquals(expected, outputStreamCaptor.toString());
    }
}
