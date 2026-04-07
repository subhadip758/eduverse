package backend;

public class Course {
    private int courseId;
    private String name;
    private String description;
    private int instructorId;

    public Course() {}

    public Course(int courseId, String name, String description, int instructorId) {
        this.courseId = courseId;
        this.name = name;
        this.description = description;
        this.instructorId = instructorId;
    }

    public int getCourseId() { return courseId; }
    public void setCourseId(int courseId) { this.courseId = courseId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getInstructorId() { return instructorId; }
    public void setInstructorId(int instructorId) { this.instructorId = instructorId; }

    @Override
    public String toString() {
        return "Course{id=" + courseId + ", name='" + name + "'}";
    }
}
