// Simple global auth state - can be replaced with proper auth later
// This is a mock implementation using a simple variable

let isLoggedIn = false;
let currentUser: { username: string } | null = null;

// Mock courses data
let courses: Array<{ id: string; name: string; description: string }> = [
	{
		id: "1",
		name: "Introduction to Programming",
		description:
			"Learn the fundamentals of programming with hands-on exercises and real-world projects.",
	},
	{
		id: "2",
		name: "Web Development Basics",
		description:
			"Master HTML, CSS, and JavaScript to build modern, responsive websites.",
	},
	{
		id: "3",
		name: "Data Science Fundamentals",
		description:
			"Explore data analysis, visualization, and machine learning concepts.",
	},
];

// Listeners for state changes
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
	for (const listener of listeners) {
		listener();
	}
}

export function subscribe(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getIsLoggedIn() {
	return isLoggedIn;
}

export function getCurrentUser() {
	return currentUser;
}

export function login(username: string) {
	isLoggedIn = true;
	currentUser = { username };
	notifyListeners();
}

export function logout() {
	isLoggedIn = false;
	currentUser = null;
	notifyListeners();
}

// Course CRUD operations
export function getCourses() {
	return courses;
}

export function addCourse(name: string, description: string) {
	const newCourse = {
		id: crypto.randomUUID(),
		name,
		description,
	};
	courses = [...courses, newCourse];
	notifyListeners();
	return newCourse;
}

export function updateCourse(id: string, name: string, description: string) {
	courses = courses.map((course) =>
		course.id === id ? { ...course, name, description } : course,
	);
	notifyListeners();
}

export function deleteCourse(id: string) {
	courses = courses.filter((course) => course.id !== id);
	notifyListeners();
}
