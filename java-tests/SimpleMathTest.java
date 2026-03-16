import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SimpleMathTest {

    private SimpleMath simpleMath;

    @BeforeEach
    void setUp() {
        simpleMath = new SimpleMath();
    }

    @Nested
    @DisplayName("Tests for add method")
    class AddTests {

        @Test
        @DisplayName("Should correctly add two positive integers")
        void testAddPositiveNumbers() {
            assertEquals(15, simpleMath.add(10, 5), "10 + 5 should be 15");
        }

        @Test
        @DisplayName("Should correctly add two negative integers")
        void testAddNegativeNumbers() {
            assertEquals(-15, simpleMath.add(-10, -5), "-10 + -5 should be -15");
        }

        @Test
        @DisplayName("Should correctly add a positive and a negative integer")
        void testAddMixedSignedNumbers() {
            assertEquals(5, simpleMath.add(10, -5), "10 + -5 should be 5");
            assertEquals(-5, simpleMath.add(-10, 5), "-10 + 5 should be -5");
        }

        @Test
        @DisplayName("Should correctly handle adding zero")
        void testAddZero() {
            assertEquals(10, simpleMath.add(10, 0), "10 + 0 should be 10");
            assertEquals(10, simpleMath.add(0, 10), "0 + 10 should be 10");
            assertEquals(0, simpleMath.add(0, 0), "0 + 0 should be 0");
        }

        @Test
        @DisplayName("Should handle integer overflow behavior (standard Java wrap-around)")
        void testAddOverflow() {
            assertEquals(Integer.MIN_VALUE, simpleMath.add(Integer.MAX_VALUE, 1), 
                "MAX_VALUE + 1 should wrap to MIN_VALUE");
        }

        @ParameterizedTest(name = "{0} + {1} = {2}")
        @CsvSource({
            "1, 2, 3",
            "0, 0, 0",
            "-1, 1, 0",
            "100, 200, 300",
            "-50, -50, -100"
        })
        void testAddParameterized(int a, int b, int expected) {
            assertEquals(expected, simpleMath.add(a, b));
        }
    }

    @Nested
    @DisplayName("Tests for subtract method")
    class SubtractTests {

        @Test
        @DisplayName("Should correctly subtract two positive integers")
        void testSubtractPositiveNumbers() {
            assertEquals(5, simpleMath.subtract(10, 5), "10 - 5 should be 5");
            assertEquals(-5, simpleMath.subtract(5, 10), "5 - 10 should be -5");
        }

        @Test
        @DisplayName("Should correctly subtract two negative integers")
        void testSubtractNegativeNumbers() {
            assertEquals(-5, simpleMath.subtract(-10, -5), "-10 - -5 should be -5");
            assertEquals(5, simpleMath.subtract(-5, -10), "-5 - -10 should be 5");
        }

        @Test
        @DisplayName("Should correctly subtract mixed signed integers")
        void testSubtractMixedSignedNumbers() {
            assertEquals(15, simpleMath.subtract(10, -5), "10 - -5 should be 15");
            assertEquals(-15, simpleMath.subtract(-10, 5), "-10 - 5 should be -15");
        }

        @Test
        @DisplayName("Should correctly handle subtracting zero")
        void testSubtractZero() {
            assertEquals(10, simpleMath.subtract(10, 0), "10 - 0 should be 10");
            assertEquals(-10, simpleMath.subtract(0, 10), "0 - 10 should be -10");
            assertEquals(0, simpleMath.subtract(0, 0), "0 - 0 should be 0");
        }

        @Test
        @DisplayName("Should handle integer underflow behavior (standard Java wrap-around)")
        void testSubtractUnderflow() {
            assertEquals(Integer.MAX_VALUE, simpleMath.subtract(Integer.MIN_VALUE, 1),
                "MIN_VALUE - 1 should wrap to MAX_VALUE");
        }

        @ParameterizedTest(name = "{0} - {1} = {2}")
        @CsvSource({
            "10, 5, 5",
            "5, 10, -5",
            "0, 0, 0",
            "-1, -1, 0",
            "100, 50, 50"
        })
        void testSubtractParameterized(int a, int b, int expected) {
            assertEquals(expected, simpleMath.subtract(a, b));
        }
    }
}
