import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SkillsProps = {
  skills: string[];
};

const Skills = ({ skills }: SkillsProps) => {
  return (
    <Card>
      <CardHeader className="mb-2 flex-row items-center border-none">
        <CardTitle className="flex-1">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-default-100 text-xs font-medium text-default-500 dark:bg-default-50"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-500">No skills added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Skills;
