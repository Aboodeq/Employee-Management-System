<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\JobTitle;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Ahmed Hassan',
            'Omar Khaled',
            'Maya Nasser',
            'Lina Ahmad',
            'Yousef Ali',
            'Sara Mahmoud',
            'Khaled Mansour',
            'Nour Ibrahim',
            'Hiba Samer',
            'Tarek Saleh',
            'Rama Fadi',
            'Bilal Mustafa',
            'Dima Omar',
            'Sami Barakat',
            'Rania Yassin',
            'Maher Karam',
            'Layla Haddad',
            'Ziad Farah',
            'Mona Darwish',
            'Firas Hamdan',
            'Dana Shami',
            'Waleed Abbas',
            'Mariam Saleem',
            'Hani Najjar',
            'Reem Qassem',
            'Nabil Saad',
            'Joud Taha',
            'Anas Rahal',
            'Alaa Issa',
            'Bayan Zain',
            'Hassan Noor',
            'Maysa Amer',
            'Karam Ayoub',
            'Nadine Halabi',
            'Bassel Khatib',
            'Ruba Jamal',
            'Adnan Kareem',
            'Farah Akram',
            'Majd Sawan',
            'Sawsan Adel',
            'Loai Naji',
            'Malak Hamed',
            'Rami Ghazal',
            'Shatha Younes',
            'Amer Sultan',
            'Ghada Rashed',
            'Ayman Fares',
            'Samar Zaki',
            'Hussein Daher',
            'Nisreen Malik',
            'Wael Azzam',
            'Jana Matar',
            'Osama Qadri',
            'Roula Salim',
            'Mazen Sharif',
            'Dalia Sami',
            'Tamer Nader',
            'Raghad Omar',
            'Sameer Yaser',
            'Noor Khalil',
            'Kinda Asaad',
            'Yara Kanaan',
            'Mohammad Darzi',
            'Salma Aref',
            'Fadi Raad',
            'Lama Shaker',
            'Ibrahim Nizar',
            'Marwa Jalal',
            'Khalil Hatem',
            'Rasha Samir',
            'Mounir Adel',
            'Hala Mansour',
            'Tala Bassam',
            'Qusai Rami',
            'Nada Youssef',
            'Jamal Naim',
            'Siba Hani',
            'Kareem Sobhi',
            'Mira Fouad',
            'Taha Zidan',
            'Abeer Hasan',
            'Fouad Nasser',
            'Lubna Kamel',
            'Rayan Saeed',
            'Shadi Talal',
            'Hadeel Murad',
            'Ghassan Amin',
            'Darin Majed',
            'Zain Hariri',
            'Mays Haddad',
            'Samer Jawad',
            'Naya Fares',
            'Bashar Riad',
            'Rima Ibrahim',
            'Ammar Salem',
            'Leen Tarek',
            'Nizar Qasim',
            'Sana Farouk',
            'Yazan Kareem',
            'Manal Saad',
        ];

        $positions = [
            'Software Developer',
            'Frontend Developer',
            'Backend Developer',
            'UI UX Designer',
            'QA Engineer',
            'Project Manager',
            'HR Specialist',
            'Accountant',
            'Sales Executive',
            'Marketing Specialist',
            'Support Engineer',
            'Data Analyst',
            'System Administrator',
            'Product Owner',
            'Business Analyst',
            'Office Manager',
            'Network Engineer',
            'Content Writer',
            'Operations Coordinator',
            'Finance Officer',
        ];

        $department = Department::updateOrCreate(
            ['name' => 'General'],
            [
                'name_ar' => 'عام',
                'description' => 'Default department for sample employees.',
                'is_active' => true,
            ],
        );

        $jobTitles = collect($positions)->mapWithKeys(function ($position) use ($department) {
            $jobTitle = JobTitle::updateOrCreate(
                [
                    'department_id' => $department->id,
                    'name' => $position,
                ],
                [
                    'name_ar' => null,
                    'description' => null,
                    'is_active' => true,
                ],
            );

            return [$position => $jobTitle];
        });

        foreach ($names as $index => $name) {
            $number = $index + 1;
            $salary = 425000 + ($index * 13750) + (($index % 9) * 3500);
            $position = $positions[$index % count($positions)];
            $jobTitle = $jobTitles[$position];

            Employee::updateOrCreate(
                ['email' => sprintf('employee%03d@ems.test', $number)],
                [
                    'name' => $name,
                    'phone' => sprintf('09%08d', 7000000 + $number),
                    'department_id' => $department->id,
                    'job_title_id' => $jobTitle->id,
                    'position' => $jobTitle->name,
                    'salary' => $salary,
                    'hire_date' => now()->subDays(45 + ($index * 11))->toDateString(),
                    'image' => null,
                ],
            );
        }
    }
}
