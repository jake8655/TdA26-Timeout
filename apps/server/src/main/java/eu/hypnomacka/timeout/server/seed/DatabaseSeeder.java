package eu.hypnomacka.timeout.server.seed;

import eu.hypnomacka.timeout.server.core.*;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.utils.HashUtil;
import java.util.List;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder {

  @EventListener(ApplicationReadyEvent.class)
  public void seed() {
    if (shouldSkipSeeding()) {
      return;
    }

    Lecturer lecturer = createLecturer();
    createCourses(lecturer);
  }

  private boolean shouldSkipSeeding() {
    return new QLecturer().username.eq("lecturer").exists();
  }

  private Lecturer createLecturer() {
    Lecturer lecturer = new Lecturer("lecturer", HashUtil.hashPassword("TdA26!"));
    lecturer.save();
    return lecturer;
  }

  private void createCourses(Lecturer lecturer) {
    createCourse1(lecturer);
    createCourse2(lecturer);
    createCourse3(lecturer);
  }

  private void createCourse1(Lecturer lecturer) {
    Course course =
        new Course(
            lecturer,
            "Introduction to Programming",
            "Learn the fundamentals of programming with hands-on examples and exercises.");
    course.setStatus(Course.Status.DRAFT);
    course.save();

    createMaterials1(course);
    createPosts1(course);
    createQuiz1(course);
  }

  private void createMaterials1(Course course) {
    FileAttachment file1 =
        new FileAttachment(
            course,
            "Getting Started Guide",
            "A comprehensive guide to setting up your development environment",
            FileAttachment.Type.file,
            245760L,
            "application/pdf",
            "https://example.com/files/getting-started.pdf");
    file1.save();

    FileAttachment file2 =
        new FileAttachment(
            course,
            "Variables and Data Types",
            "Lecture slides covering variables, types, and basic operations",
            FileAttachment.Type.file,
            102400L,
            "application/pdf",
            "https://example.com/files/variables.pdf");
    file2.save();

    UrlAttachment url1 =
        new UrlAttachment(
            course,
            "Official Documentation",
            "https://vercel.com",
            "Official language documentation and tutorials",
            UrlAttachment.Type.url,
            "https://vercel.com/favicon.ico");
    url1.save();
  }

  private void createPosts1(Course course) {
    Event post1 = new Event();
    post1.setCourse(course);
    post1.setType(Event.Type.MANUAL);
    post1.setMessage(
        "Welcome to Introduction to Programming! Please review the syllabus and introduce yourself"
            + " in the discussion forum.");
    post1.save();

    Event post2 = new Event();
    post2.setCourse(course);
    post2.setType(Event.Type.MANUAL);
    post2.setMessage(
        "Assignment 1 has been posted. Due date: next Friday. Remember to submit through the"
            + " portal.");
    post2.save();
  }

  private void createQuiz1(Course course) {
    Quiz quiz = new Quiz(course, "Programming Basics Quiz");
    quiz.save();

    Question q1 = new Question();
    q1.setQuiz(quiz);
    q1.setType(Question.Type.singleChoice);
    q1.setQuestion("What is a variable?");
    q1.setOptions(List.of("A fixed value", "A named storage location", "A function", "A class"));
    q1.setCorrectIndex(1);
    q1.setPosition(0);
    q1.save();

    Question q2 = new Question();
    q2.setQuiz(quiz);
    q2.setType(Question.Type.singleChoice);
    q2.setQuestion("Which data type would you use to store a decimal number?");
    q2.setOptions(List.of("int", "boolean", "float", "char"));
    q2.setCorrectIndex(2);
    q2.setPosition(1);
    q2.save();

    Question q3 = new Question();
    q3.setQuiz(quiz);
    q3.setType(Question.Type.multipleChoice);
    q3.setQuestion("Select all valid variable names:");
    q3.setOptions(List.of("myVar", "2ndVar", "_private", "class", "userName"));
    q3.setCorrectIndices(List.of(0, 2, 4));
    q3.setPosition(2);
    q3.save();
  }

  private void createCourse2(Lecturer lecturer) {
    Course course =
        new Course(
            lecturer,
            "Data Structures",
            "Master essential data structures including arrays, linked lists, trees, and graphs.");
    course.setStatus(Course.Status.DRAFT);
    course.save();

    createMaterials2(course);
    createPosts2(course);
    createQuiz2(course);
  }

  private void createMaterials2(Course course) {
    FileAttachment file1 =
        new FileAttachment(
            course,
            "Arrays and Lists Cheatsheet",
            "Quick reference for array and list operations",
            FileAttachment.Type.file,
            51200L,
            "application/pdf",
            "https://example.com/files/arrays-cheatsheet.pdf");
    file1.save();

    UrlAttachment url1 =
        new UrlAttachment(
            course,
            "Visualizer Tool",
            "https://sort.dominiktoth.com",
            "Interactive data structure visualization tool",
            UrlAttachment.Type.url,
            "https://sort.dominiktoth.com/favicon.ico");
    url1.save();

    UrlAttachment url2 =
        new UrlAttachment(
            course,
            "Practice Problems",
            "https://github.com",
            "Online practice platform with instant feedback",
            UrlAttachment.Type.url,
            "https://github.com/favicon.ico");
    url2.save();
  }

  private void createPosts2(Course course) {
    Event post1 = new Event();
    post1.setCourse(course);
    post1.setType(Event.Type.MANUAL);
    post1.setMessage(
        "This week we dive into linked lists. Check the materials section for implementation"
            + " examples.");
    post1.save();

    Event post2 = new Event();
    post2.setCourse(course);
    post2.setType(Event.Type.MANUAL);
    post2.setMessage(
        "Midterm exam scheduled for Week 8. Topics: Arrays, Linked Lists, Stacks, and Queues.");
    post2.save();

    Event post3 = new Event();
    post3.setCourse(course);
    post3.setType(Event.Type.SYSTEM);
    post3.setMessage("New quiz available: Binary Trees fundamentals.");
    post3.save();
  }

  private void createQuiz2(Course course) {
    Quiz quiz = new Quiz(course, "Data Structures Fundamentals");
    quiz.save();

    Question q1 = new Question();
    q1.setQuiz(quiz);
    q1.setType(Question.Type.singleChoice);
    q1.setQuestion("What is the time complexity of accessing an element in an array by index?");
    q1.setOptions(List.of("O(1)", "O(n)", "O(log n)", "O(n^2)"));
    q1.setCorrectIndex(0);
    q1.setPosition(0);
    q1.save();

    Question q2 = new Question();
    q2.setQuiz(quiz);
    q2.setType(Question.Type.singleChoice);
    q2.setQuestion("Which data structure uses LIFO principle?");
    q2.setOptions(List.of("Queue", "Stack", "Array", "Tree"));
    q2.setCorrectIndex(1);
    q2.setPosition(1);
    q2.save();

    Question q3 = new Question();
    q3.setQuiz(quiz);
    q3.setType(Question.Type.multipleChoice);
    q3.setQuestion("Which of the following are linear data structures?");
    q3.setOptions(List.of("Array", "Tree", "Linked List", "Graph", "Stack"));
    q3.setCorrectIndices(List.of(0, 2, 4));
    q3.setPosition(2);
    q3.save();
  }

  private void createCourse3(Lecturer lecturer) {
    Course course =
        new Course(
            lecturer,
            "Web Development",
            "Build modern web applications using HTML, CSS, JavaScript, and popular frameworks.");
    course.setStatus(Course.Status.DRAFT);
    course.save();

    createMaterials3(course);
    createPosts3(course);
    createQuiz3(course);
  }

  private void createMaterials3(Course course) {
    FileAttachment file1 =
        new FileAttachment(
            course,
            "HTML5 Reference Card",
            "Complete reference for HTML5 elements and attributes",
            FileAttachment.Type.file,
            81920L,
            "application/pdf",
            "https://example.com/files/html5-ref.pdf");
    file1.save();

    FileAttachment file2 =
        new FileAttachment(
            course,
            "CSS Flexbox Guide",
            "Visual guide to CSS flexbox layout",
            FileAttachment.Type.file,
            156000L,
            "application/pdf",
            "https://example.com/files/flexbox.pdf");
    file2.save();

    UrlAttachment url1 =
        new UrlAttachment(
            course,
            "MDN Web Docs",
            "https://developer.mozilla.org",
            "Comprehensive web development documentation",
            UrlAttachment.Type.url,
            "https://developer.mozilla.org/favicon.ico");
    url1.save();
  }

  private void createPosts3(Course course) {
    Event post1 = new Event();
    post1.setCourse(course);
    post1.setType(Event.Type.MANUAL);
    post1.setMessage(
        "Welcome to Web Development! We'll start with HTML basics this week. Please have your code"
            + " editor ready.");
    post1.save();

    Event post2 = new Event();
    post2.setCourse(course);
    post2.setType(Event.Type.MANUAL);
    post2.setMessage(
        "Project 1: Personal Portfolio Website. Requirements are now available in the materials"
            + " section.");
    post2.save();
  }

  private void createQuiz3(Course course) {
    Quiz quiz = new Quiz(course, "Web Technologies Quiz");
    quiz.save();

    Question q1 = new Question();
    q1.setQuiz(quiz);
    q1.setType(Question.Type.singleChoice);
    q1.setQuestion("What does HTML stand for?");
    q1.setOptions(
        List.of(
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"));
    q1.setCorrectIndex(0);
    q1.setPosition(0);
    q1.save();

    Question q2 = new Question();
    q2.setQuiz(quiz);
    q2.setType(Question.Type.singleChoice);
    q2.setQuestion("Which CSS property is used to change text color?");
    q2.setOptions(List.of("text-color", "font-color", "color", "foreground"));
    q2.setCorrectIndex(2);
    q2.setPosition(1);
    q2.save();

    Question q3 = new Question();
    q3.setQuiz(quiz);
    q3.setType(Question.Type.multipleChoice);
    q3.setQuestion("Which are valid ways to include CSS in HTML?");
    q3.setOptions(
        List.of("Inline style attribute", "<link> tag", "<css> tag", "@import", "<style> tag"));
    q3.setCorrectIndices(List.of(0, 1, 3, 4));
    q3.setPosition(2);
    q3.save();
  }
}
