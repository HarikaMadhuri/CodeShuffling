import { PrismaClient, Year } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const thirdYearQuestions = [
  { title: "Second Largest Number in an Array", lines: ["import java.util.Scanner;", "class SecondLargest {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        int n;", "        System.out.print(\"Enter array size: \");", "        n = sc.nextInt();", "        int[] arr = new int[n];", "        System.out.println(\"Enter array elements:\");", "        for (int i = 0; i < n; i++) {", "            arr[i] = sc.nextInt();", "        }", "        int largest = Integer.MIN_VALUE;", "        int second = Integer.MIN_VALUE;", "        for (int i = 0; i < n; i++) {", "            if (arr[i] > largest) {", "                second = largest;", "                largest = arr[i];", "            } else if (arr[i] > second && arr[i] != largest) {", "                second = arr[i];", "            }", "        }", "        if (second == Integer.MIN_VALUE) {", "            System.out.println(\"Second largest element does not exist\");", "        } else {", "            System.out.println(\"Largest = \" + largest);", "            System.out.println(\"Second Largest = \" + second);", "        }", "        sc.close();", "    }", "}" ] },
  { title: "Reverse a Number", lines: ["import java.util.Scanner;", "class ReverseNumber {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        int n;", "        int reverse = 0;", "        int digit;", "        System.out.print(\"Enter a number: \");", "        n = sc.nextInt();", "        int original = n;", "        while (n != 0) {", "            digit = n % 10;", "            reverse = reverse * 10 + digit;", "            n = n / 10;", "        }", "        System.out.println(\"Original Number = \" + original);", "        System.out.println(\"Reversed Number = \" + reverse);", "        sc.close();", "    }", "}" ] },
  { title: "Frequency of Elements Using HashMap", lines: ["import java.util.HashMap;", "import java.util.Scanner;", "class FrequencyHashMap {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        int n;", "        System.out.print(\"Enter number of elements: \");", "        n = sc.nextInt();", "        HashMap<Integer, Integer> frequency = new HashMap<>();", "        System.out.println(\"Enter elements:\");", "        for (int i = 0; i < n; i++) {", "            int value = sc.nextInt();", "            frequency.put(value, frequency.getOrDefault(value, 0) + 1);", "        }", "        System.out.println(\"Element Frequencies:\");", "        for (int key : frequency.keySet()) {", "            System.out.println(key + \":\" + frequency.get(key));", "        }", "        sc.close();", "    }", "}" ] },
  { title: "Automorphic Number", lines: ["import java.util.Scanner;", "class Automorphic {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        int n;", "        int square;", "        int temp;", "        int digits = 0;", "        int divisor = 1;", "        System.out.print(\"Enter a number: \");", "        n = sc.nextInt();", "        square = n * n;", "        temp = n;", "        while (temp > 0) {", "            digits++;", "            temp = temp / 10;", "        }", "        for (int i = 1; i <= digits; i++) {", "            divisor = divisor * 10;", "        }", "        int lastPart = square % divisor;", "        System.out.println(\"Square: \" + square);", "        System.out.println(\"Last part: \" + lastPart);", "        if (lastPart == n) {", "            System.out.println(\"Automorphic Number\");", "        } else {", "            System.out.println(\"Not an Automorphic Number\");", "        }", "        sc.close();", "    }", "}" ] },
  { title: "Check String Palindrome", lines: ["import java.util.Scanner;", "class StringPalindrome {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        String str;", "        String reverse = \"\";", "        System.out.print(\"Enter a string: \");", "        str = sc.nextLine();", "        for (int i = str.length() - 1; i >= 0; i--) {", "            reverse = reverse + str.charAt(i);", "        }", "        System.out.println(\"Original String: \" + str);", "        System.out.println(\"Reversed String: \" + reverse);", "        if (str.equalsIgnoreCase(reverse)) {", "            System.out.println(\"Palindrome String\");", "        } else {", "            System.out.println(\"Not a Palindrome String\");", "        }", "        sc.close();", "    }", "}" ] },
  { title: "Anagram Check", lines: ["import java.util.Arrays;", "import java.util.Scanner;", "class Anagram {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        String first;", "        String second;", "        System.out.print(\"Enter first string: \");", "        first = sc.nextLine();", "        System.out.print(\"Enter second string: \");", "        second = sc.nextLine();", "        first = first.replaceAll(\"\\\\s+\", \"\").toLowerCase();", "        second = second.replaceAll(\"\\\\s+\", \"\").toLowerCase();", "        if (first.length() != second.length()) {", "            System.out.println(\"Not Anagrams\");", "            sc.close();", "            return;", "        }", "        char[] a = first.toCharArray();", "        char[] b = second.toCharArray();", "        Arrays.sort(a);", "        Arrays.sort(b);", "        System.out.println(\"Sorted First String: \" + String.valueOf(a));", "        System.out.println(\"Sorted Second String: \" + String.valueOf(b));", "        if (Arrays.equals(a, b)) {", "            System.out.println(\"Anagram Strings\");", "        } else {", "            System.out.println(\"Not Anagram Strings\");", "        }", "        sc.close();", "    }", "}" ] },
  { title: "Count Vowels, Consonants, Digits & Spaces", lines: ["import java.util.Scanner;", "class CharacterCounter {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        String str;", "        int vowels = 0;", "        int consonants = 0;", "        int digits = 0;", "        int spaces = 0;", "        System.out.print(\"Enter a string: \");", "        str = sc.nextLine();", "        for (int i = 0; i < str.length(); i++) {", "            char ch = str.charAt(i);", "            if (Character.isDigit(ch)) {", "                digits++;", "            } else if (ch == ' ') {", "                spaces++;", "            } else if (Character.isLetter(ch)) {", "                char lower = Character.toLowerCase(ch);", "                if (lower == 'a' || lower == 'e' || lower == 'i' || lower == 'o' || lower == 'u') {", "                    vowels++;", "                } else {", "                    consonants++;", "                }", "            }", "        }", "        System.out.println(\"Vowels: \" + vowels);", "        System.out.println(\"Consonants: \" + consonants);", "        System.out.println(\"Digits: \" + digits);", "        System.out.println(\"Spaces: \" + spaces);", "        sc.close();", "    }", "}" ] },
  { title: "Binary Search", lines: ["import java.util.Scanner;", "class BinarySearch {", "    public static void main(String[] args) {", "        Scanner sc = new Scanner(System.in);", "        int n;", "        System.out.print(\"Enter array size: \");", "        n = sc.nextInt();", "        int[] arr = new int[n];", "        System.out.println(\"Enter sorted array elements:\");", "        for (int i = 0; i < n; i++) {", "            arr[i] = sc.nextInt();", "        }", "        System.out.print(\"Enter element to search: \");", "        int key = sc.nextInt();", "        int low = 0;", "        int high = n - 1;", "        int position = -1;", "        while (low <= high) {", "            int mid = low + (high - low) / 2;", "            if (arr[mid] == key) {", "                position = mid;", "                break;", "            } else if (arr[mid] < key) {", "                low = mid + 1;", "            } else {", "                high = mid - 1;", "            }", "        }", "        if (position != -1) {", "            System.out.println(\"Element found at index: \" + position);", "        } else {", "            System.out.println(\"Element not found\");", "        }", "        sc.close();", "    }", "}" ] },
];
const secondYearQuestions = [
  {
    title: "Print Prime Numbers in a Given Range",
    lines: [
      "#include <stdio.h>", "int main() {", "  int L, R;", "  printf(\"Enter L and R: \");", "  scanf(\"%d %d\", &L, &R);", "  printf(\"Prime numbers between %d and %d: \", L, R);", "  for (int i = L; i <= R; i++) {", "    int count = 0;", "    for (int j = 1; j <= i; j++) {", "      if (i % j == 0) count++;", "    }", "    if (count == 2) printf(\"%d \", i);", "  }", "  printf(\"\\n\");", "  return 0;", "}"
    ],
  },
  {
    title: "Prime Factorization of a Number",
    lines: [
      "#include <stdio.h>", "int main() {", "  int n;", "  printf(\"Enter a number: \");", "  scanf(\"%d\", &n);", "  printf(\"Prime factorization: \");", "  for (int i = 2; i <= n; i++) {", "    while (n % i == 0) {", "      printf(\"%d \", i);", "      n = n / i;", "    }", "  }", "  printf(\"\\n\");", "  return 0;", "}"
    ],
  },
  {
    title: "Sum of All Factors",
    lines: [
      "#include <stdio.h>", "int main() {", "  int n, sum = 0;", "  printf(\"Enter a number: \");", "  scanf(\"%d\", &n);", "  for (int i = 1; i <= n; i++) {", "    if (n % i == 0) {", "      sum += i;", "    }", "  }", "  printf(\"Sum of factors of %d: %d\\n\", n, sum);", "  return 0;", "}"
    ],
  },
  {
    title: "Print Armstrong Numbers in a Range",
    lines: [
      "#include <stdio.h>", "int main() {", "  int L, R;", "  printf(\"Enter range (L R): \");", "  scanf(\"%d %d\", &L, &R);", "  printf(\"Armstrong numbers between %d and %d: \", L, R);", "  for (int i = L; i <= R; i++) {", "    int temp = i, sum = 0;", "    while (temp > 0) {", "      int digit = temp % 10;", "      sum += digit * digit * digit;", "      temp = temp / 10;", "    }", "    if (sum == i) printf(\"%d \", i);", "  }", "  printf(\"\\n\");", "  return 0;", "}"
    ],
  },
  {
    title: "Neon Number",
    lines: [
      "#include <stdio.h>", "int main() {", "  int n, square, sum = 0;", "  printf(\"Enter a number: \");", "  scanf(\"%d\", &n);", "  square = n * n;", "  while (square > 0) {", "    sum += square % 10;", "    square = square / 10;", "  }", "  if (sum == n) {", "    printf(\"%d is a Neon number.\\n\", n);", "  } else {", "    printf(\"%d is not a Neon number.\\n\", n);", "  }", "  return 0;", "}"
    ],
  },
  {
    title: "Spy Number",
    lines: [
      "#include <stdio.h>", "int main() {", "  int n, temp, sum = 0, product = 1;", "  printf(\"Enter a number: \");", "  scanf(\"%d\", &n);", "  temp = n;", "  while (temp > 0) {", "    int digit = temp % 10;", "    sum += digit;", "    product *= digit;", "    temp = temp / 10;", "  }", "  if (sum == product) {", "    printf(\"%d is a Spy number.\\n\", n);", "  } else {", "    printf(\"%d is not a Spy number.\\n\", n);", "  }", "  return 0;", "}"
    ],
  },
  {
    title: "Decimal to Binary Conversion",
    lines: [
      "#include <stdio.h>", "int main() {", "  int n, binary = 0, place = 1;", "  printf(\"Enter a decimal number: \");", "  scanf(\"%d\", &n);", "  while (n > 0) {", "    int remainder = n % 2;", "    binary += remainder * place;", "    n = n / 2;", "    place *= 10;", "  }", "  printf(\"Binary: %d\\n\", binary);", "  return 0;", "}"
    ],
  },
  {
    title: "Frequency of Digits in a Number",
    lines: [
      "#include <stdio.h>", "int main() {", "  long long n;", "  printf(\"Enter a number: \");", "  scanf(\"%lld\", &n);", "  for (int digit = 0; digit <= 9; digit++) {", "    int count = 0;", "    long long temp = n;", "    while (temp > 0) {", "      if (temp % 10 == digit) count++;", "      temp = temp / 10;", "    }", "    if (count > 0) printf(\"Digit %d appears %d time(s)\\n\", digit, count);", "  }", "  return 0;", "}"
    ],
  },
];
async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: adminHash },
  });
  await prisma.question.updateMany({
    where: { year: Year.SECOND, codeNumber: { gt: secondYearQuestions.length } },
    data: { enabled: false },
  });
  await prisma.question.updateMany({
    where: { year: Year.THIRD, codeNumber: { gt: thirdYearQuestions.length } },
    data: { enabled: false },
  });
  for (const year of [Year.SECOND, Year.THIRD]) {
    for (let i = 1; i <= 10; i++) {
      const questionSet = year === Year.SECOND ? secondYearQuestions : thirdYearQuestions;
      const suppliedQuestion = i <= questionSet.length ? questionSet[i - 1] : undefined;
      const question = await prisma.question.upsert({
        where: { year_codeNumber: { year, codeNumber: i } },
        update: {
          title: suppliedQuestion?.title ?? `Challenge ${i}`,
          language: year === Year.SECOND ? "C" : "Java",
          enabled: Boolean(suppliedQuestion),
          difficulty: i < 4 ? "Foundation" : "Intermediate",
        },
        create: {
          year,
          codeNumber: i,
          title: suppliedQuestion?.title ?? `Challenge ${i}`,
          language: year === Year.SECOND ? "C" : "Java",
          enabled: Boolean(suppliedQuestion),
          difficulty: i < 4 ? "Foundation" : "Intermediate",
        },
      });
      if (suppliedQuestion) {
        await prisma.questionLine.deleteMany({ where: { questionId: question.id } });
        await prisma.questionLine.createMany({
          data: suppliedQuestion.lines.map((content, position) => ({ questionId: question.id, position, content })),
        });
        continue;
      }
    }
  }
  await prisma.eventSetting.upsert({
    where: { key: "status" },
    update: { value: "OPEN" },
    create: { key: "status", value: "OPEN" },
  });
  console.log(
    "Seeded the administrator account and question banks.",
  );
}
main().finally(() => prisma.$disconnect());
