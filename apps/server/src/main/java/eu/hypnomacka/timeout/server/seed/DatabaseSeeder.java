package eu.hypnomacka.timeout.server.seed;

import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Branch;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Country;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QAccount;
import eu.hypnomacka.timeout.server.core.query.QCountry;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.utils.HashUtil;
import io.ebean.DB;
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

    Country country = createCountry();
    Account admin = createAdmin();
    Account manager = createManager();
    Account lecturerAccount = createLecturerAccount();
    Branch branch = createBranch(country, manager, lecturerAccount);

    Lecturer lecturer = createLecturer();
    createCourse1(lecturer, country, branch);
    createCourse2(lecturer, country, branch);
    createCourse3(lecturer, country, branch);
  }

  private boolean shouldSkipSeeding() {
    return new QLecturer().username.eq("lecturer").exists() || new QAccount().username.eq("admin").exists();
  }

  private Country createCountry() {
    Country existing = new QCountry().isoCode.eq("CZ").findOne();
    if (existing != null) {
      return existing;
    }

    Country country = new Country("CZ", "Czech Republic", Country.Status.ACTIVE);
    country.save();
    return country;
  }

  private Account createAdmin() {
    Account admin =
        new Account("admin", HashUtil.hashPassword("TdA26!"), "Global Admin", Account.Role.ADMIN);
    admin.save();
    return admin;
  }

  private Account createManager() {
    Account manager =
        new Account(
            "manager",
            HashUtil.hashPassword("TdA26!"),
            "Prague Branch Manager",
            Account.Role.MANAGER);
    manager.save();
    return manager;
  }

  private Account createLecturerAccount() {
    Account lecturer =
        new Account("lecturer", HashUtil.hashPassword("TdA26!"), "Lecturer", Account.Role.LECTURER);
    lecturer.save();
    return lecturer;
  }

  private Branch createBranch(Country country, Account manager, Account lecturerAccount) {
    Branch existing =
        DB.find(Branch.class)
            .where()
            .eq("country.id", country.getId())
            .eq("name", "Prague HQ")
            .findOne();
    if (existing != null) {
      return existing;
    }

    Branch branch =
        new Branch(
            country,
            "Prague HQ",
            "Prague",
            "Main Square 1",
            "11000",
            "Central Europe",
            Branch.Type.HQ,
            Branch.Status.ACTIVE,
            manager,
            lecturerAccount);
    branch.save();
    return branch;
  }

  private Lecturer createLecturer() {
    Lecturer lecturer = new Lecturer("lecturer", HashUtil.hashPassword("TdA26!"));
    lecturer.save();
    return lecturer;
  }

  private void createCourse1(Lecturer lecturer, Country country, Branch branch) {
    Course course =
        new Course(
            lecturer,
            "Introduction to Programming",
            "Learn the fundamentals of programming with hands-on examples and exercises.");
    course.setStatus(Course.Status.DRAFT);
    course.setCountry(country);
    course.setBranch(branch);
    course.save();

    Module module = new Module(course, "Module 1: Basics", "Kickoff materials and first quiz");
    module.save();

    createCourse1Materials(module);
    createCourse1Quiz(module);
  }

  private void createCourse1Materials(Module module) {
    FileAttachment file1 =
        new FileAttachment(
            module,
            "Getting Started Guide",
            "A comprehensive guide to setting up your development environment",
            FileAttachment.Type.file,
            245760L,
            "application/pdf",
            "https://example.com/files/getting-started.pdf");
    file1.save();

    UrlAttachment url1 =
        new UrlAttachment(
            module,
            "Official Documentation",
            "https://vercel.com",
            "Official language documentation and tutorials",
            UrlAttachment.Type.url,
            "https://vercel.com/favicon.ico");
    url1.save();
  }

  private void createCourse1Quiz(Module module) {
    Quiz quiz = new Quiz(module, "Programming Basics Quiz");
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
    q2.setType(Question.Type.multipleChoice);
    q2.setQuestion("Select all valid variable names:");
    q2.setOptions(List.of("myVar", "2ndVar", "_private", "class", "userName"));
    q2.setCorrectIndices(List.of(0, 2, 4));
    q2.setPosition(1);
    q2.save();
  }

  private void createCourse2(Lecturer lecturer, Country country, Branch branch) {
    Course course =
        new Course(
            lecturer,
            "Data Structures",
            "Master essential data structures including arrays, linked lists, trees, and graphs.");
    course.setStatus(Course.Status.DRAFT);
    course.setCountry(country);
    course.setBranch(branch);
    course.save();

    Module module =
        new Module(
            course, "Module 1: Linear Structures", "Arrays, lists, and stack/queue foundations");
    module.save();

    UrlAttachment url =
        new UrlAttachment(
            module,
            "Visualizer Tool",
            "https://sort.dominiktoth.com",
            "Interactive data structure visualization tool",
            UrlAttachment.Type.url,
            "https://sort.dominiktoth.com/favicon.ico");
    url.save();

    Quiz quiz = new Quiz(module, "Data Structures Fundamentals");
    quiz.save();

    Question q1 = new Question();
    q1.setQuiz(quiz);
    q1.setType(Question.Type.singleChoice);
    q1.setQuestion("Which data structure uses LIFO principle?");
    q1.setOptions(List.of("Queue", "Stack", "Array", "Tree"));
    q1.setCorrectIndex(1);
    q1.setPosition(0);
    q1.save();
  }

  private void createCourse3(Lecturer lecturer, Country country, Branch branch) {
    Course course =
        new Course(
            lecturer,
            "Web Development",
            "Build modern web applications using HTML, CSS, JavaScript, and popular frameworks.");
    course.setStatus(Course.Status.DRAFT);
    course.setCountry(country);
    course.setBranch(branch);
    course.save();

    Module module =
        new Module(course, "Module 1: Web Foundations", "HTML/CSS starter resources and quiz");
    module.save();

    FileAttachment file =
        new FileAttachment(
            module,
            "HTML5 Reference Card",
            "Complete reference for HTML5 elements and attributes",
            FileAttachment.Type.file,
            81920L,
            "application/pdf",
            "https://example.com/files/html5-ref.pdf");
    file.save();

    Quiz quiz = new Quiz(module, "Web Technologies Quiz");
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
  }
}
